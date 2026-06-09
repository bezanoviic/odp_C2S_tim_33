import mysql, { Pool, PoolConnection } from "mysql2/promise";
import dotenv from "dotenv";
import { DbNode } from "../../Domain/models/DbNode";
import { NodeStatus } from "../../Domain/enums/NodeStatus";
import { HEALTH_CHECK_TIMEOUT, HEALTH_CHECK_INTERVAL_MS } from "../../Domain/constants/Constants";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";

dotenv.config();

const DB_NAME = process.env.DB_NAME ?? "project_db";

export const masterPool: Pool = mysql.createPool({
  host: process.env.DB_MASTER_HOST ?? "localhost",
  port: parseInt(process.env.DB_MASTER_PORT ?? "3306", 10),
  user: process.env.DB_MASTER_USER ?? "root",
  password: process.env.DB_MASTER_PASSWORD ?? "",
  database: process.env.DB_MASTER_NAME ?? DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: HEALTH_CHECK_TIMEOUT,
});

const slave1Pool: Pool = mysql.createPool({
  host: process.env.DB_SLAVE1_HOST ?? "localhost",
  port: parseInt(process.env.DB_SLAVE1_PORT ?? "3307", 10),
  user: process.env.DB_SLAVE1_USER ?? "root",
  password: process.env.DB_SLAVE1_PASSWORD ?? "",
  database: process.env.DB_SLAVE1_NAME ?? DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: HEALTH_CHECK_TIMEOUT,
});

const slave2Pool: Pool = mysql.createPool({
  host: process.env.DB_SLAVE2_HOST ?? "localhost",
  port: parseInt(process.env.DB_SLAVE2_PORT ?? "3308", 10),
  user: process.env.DB_SLAVE2_USER ?? "root",
  password: process.env.DB_SLAVE2_PASSWORD ?? "",
  database: process.env.DB_SLAVE2_NAME ?? DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: HEALTH_CHECK_TIMEOUT,
});

interface NodeInfo {
  name: string;
  pool: Pool;
  node: DbNode;
}

export class DbManager {
  private readonly master: NodeInfo;
  private readonly slaves: NodeInfo[];
  private promotedWriteNode: NodeInfo | null = null;
  private slaveRrIndex: number = 0;
  private healthTimer: NodeJS.Timeout | null = null;

  public constructor(private readonly logger: ILoggerService) {
    this.master = {
      name: "master",
      pool: masterPool,
      node: new DbNode("master", process.env.DB_MASTER_HOST ?? "localhost", parseInt(process.env.DB_MASTER_PORT ?? "3306", 10)),
    };
    this.slaves = [
      { name: "slave1", pool: slave1Pool, node: new DbNode("slave1", process.env.DB_SLAVE1_HOST ?? "localhost", parseInt(process.env.DB_SLAVE1_PORT ?? "3307", 10)) },
      { name: "slave2", pool: slave2Pool, node: new DbNode("slave2", process.env.DB_SLAVE2_HOST ?? "localhost", parseInt(process.env.DB_SLAVE2_PORT ?? "3308", 10)) },
    ];
  }

  private async checkNode(info: NodeInfo): Promise<void> {
    const start = Date.now();
    let conn: PoolConnection | null = null;

    try {
      conn = await info.pool.getConnection();
      await conn.query("SELECT 1");
      const ms = Date.now() - start;
      info.node.latencyMs = ms;
      info.node.status = ms > HEALTH_CHECK_TIMEOUT ? NodeStatus.DEGRADED : NodeStatus.HEALTHY;
    } catch (err) {
      info.node.status = NodeStatus.OFFLINE;
      info.node.latencyMs = null;
      info.node.failedWrites++;
      this.logger.warn("DB", `Node ${info.name} failed health check`);
    } finally {
      if (conn) conn.release();
      info.node.lastCheck = new Date();
    }
  }

  public async runHealthCheck(): Promise<void> {
    await Promise.all([this.master, ...this.slaves].map((n) => this.checkNode(n)));
    this.logger.info("DB", [this.master, ...this.slaves].map((n) => `${n.name}=${n.node.status}`).join(" | "));
  }

  public async init(): Promise<void> {
    await this.runHealthCheck();
    this.healthTimer = setInterval(() => void this.runHealthCheck(), HEALTH_CHECK_INTERVAL_MS);
  }

  public async getWriteConnection(): Promise<{ conn: PoolConnection; nodeName: string } | null> {
    const writeNode = this.getActiveWriteNode();
    if (!writeNode) return null;

    try {
      const conn = await writeNode.pool.getConnection();
      writeNode.node.successfulWrites++;
      return { conn, nodeName: writeNode.name };
    } catch (err) {
      writeNode.node.status = NodeStatus.OFFLINE;
      writeNode.node.failedWrites++;
      if (this.promotedWriteNode?.name === writeNode.name) this.promotedWriteNode = null;
      this.logger.error("DB", `Failed to connect to write node ${writeNode.name}`, err as Error);
      return null;
    }
  }

  private getActiveWriteNode(): NodeInfo | null {
    if (this.master.node.status !== NodeStatus.OFFLINE) {
      this.promotedWriteNode = null;
      return this.master;
    }

    if (this.promotedWriteNode && this.promotedWriteNode.node.status !== NodeStatus.OFFLINE) {
      return this.promotedWriteNode;
    }

    const candidate = this.slaves.find((info) => info.node.status !== NodeStatus.OFFLINE) ?? null;
    if (!candidate) {
      this.logger.error("DB", "No healthy write node available");
      return null;
    }

    this.promotedWriteNode = candidate;
    this.logger.warn("DB", `Master is offline; promoted ${candidate.name} for writes`);
    return candidate;
  }

  public async getReadConnection(): Promise<{ conn: PoolConnection; nodeName: string } | null> {
    const n = this.slaves.length;
    for (let i = 0; i < n; i++) {
      const idx = (this.slaveRrIndex + i) % n;
      const info = this.slaves[idx];
      if (info.node.status === NodeStatus.OFFLINE) continue;

      try {
        const conn = await info.pool.getConnection();
        this.slaveRrIndex = (idx + 1) % n;
        return { conn, nodeName: info.name };
      } catch (err) {
        info.node.status = NodeStatus.OFFLINE;
        info.node.failedWrites++;
        this.logger.warn("DB", `Slave ${info.name} unreachable, trying next`);
      }
    }

    this.logger.warn("DB", "All slaves offline; falling back to master for read");
    return this.getMasterConnection();
  }

  public async getMasterConnection(): Promise<{ conn: PoolConnection; nodeName: string } | null> {
    if (this.master.node.status === NodeStatus.OFFLINE) {
      this.logger.error("DB", "Master is offline; read fallback is unavailable");
      return null;
    }

    try {
      const conn = await this.master.pool.getConnection();
      return { conn, nodeName: this.master.name };
    } catch (err) {
      this.master.node.status = NodeStatus.OFFLINE;
      this.master.node.failedWrites++;
      this.logger.error("DB", "Failed to connect to master for fallback read", err as Error);
      return null;
    }
  }

  public getNodes(): DbNode[] {
    return [this.master.node, ...this.slaves.map((s) => s.node)];
  }

  public getSlaveRrIndex(): number {
    return this.slaveRrIndex;
  }

  public stop(): void {
    if (this.healthTimer) clearInterval(this.healthTimer);
  }
}
