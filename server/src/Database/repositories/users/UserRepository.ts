import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import { UserRole } from "../../../Domain/enums/UserRole";
import { DbManager } from "../../connection/DbConnectionPool";
import { ILoggerService } from "../../../Domain/services/logger/ILoggerService";

export class UserRepository implements IUserRepository {
  public constructor(
    private readonly db: DbManager,
    private readonly logger: ILoggerService,
  ) {}

  private map(r: RowDataPacket): User {
    return new User(
      r.id,
      r.gamer_tag,
      r.full_name,
      r.email,
      r.role as UserRole,
      r.password_hash,
      r.profile_image ?? null,
    );
  }

  async create(user: User): Promise<User> {
    const res = await this.db.getWriteConnection();
    if (!res) return new User();
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `INSERT INTO users (gamer_tag, full_name, email, role, password_hash, profile_image)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.gamer_tag, user.full_name, user.email, user.role, user.password_hash, user.profile_image ?? null],
      );
      if (result.insertId === 0) return new User();
      return new User(
        result.insertId,
        user.gamer_tag,
        user.full_name,
        user.email,
        user.role,
        user.password_hash,
        user.profile_image ?? null,
      );
    } catch (err) {
      this.logger.error("UserRepository", "create failed", err as Error);
      return new User();
    } finally {
      res.conn.release();
    }
  }

  async findById(id: number): Promise<User> {
    const res = await this.db.getReadConnection();
    if (!res) return new User();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM users WHERE id = ?`,
        [id],
      );
      return rows.length > 0 ? this.map(rows[0]) : new User();
    } catch (err) {
      this.logger.error("UserRepository", "findById failed", err as Error);
      return new User();
    } finally {
      res.conn.release();
    }
  }

  async findByGamerTag(tag: string): Promise<User> {
    const res = await this.db.getReadConnection();
    if (!res) return new User();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM users WHERE gamer_tag = ?`,
        [tag],
      );
      return rows.length > 0 ? this.map(rows[0]) : new User();
    } catch (err) {
      this.logger.error("UserRepository", "findByGamerTag failed", err as Error);
      return new User();
    } finally {
      res.conn.release();
    }
  }

  async findByEmail(email: string): Promise<User> {
    const res = await this.db.getReadConnection();
    if (!res) return new User();
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM users WHERE email = ?`,
        [email],
      );
      return rows.length > 0 ? this.map(rows[0]) : new User();
    } catch (err) {
      this.logger.error("UserRepository", "findByEmail failed", err as Error);
      return new User();
    } finally {
      res.conn.release();
    }
  }

  async findAll(): Promise<User[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM users ORDER BY id ASC`,
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("UserRepository", "findAll failed", err as Error);
      return [];
    } finally {
      res.conn.release();
    }
  }

  async searchByGamerTag(query: string): Promise<User[]> {
    const res = await this.db.getReadConnection();
    if (!res) return [];
    try {
      const [rows] = await res.conn.execute<RowDataPacket[]>(
        `SELECT * FROM users WHERE gamer_tag LIKE ? ORDER BY gamer_tag ASC LIMIT 20`,
        [`%${query}%`],
      );
      return rows.map((r) => this.map(r));
    } catch (err) {
      this.logger.error("UserRepository", "searchByGamerTag failed", err as Error);
      return [];
    } finally {
      res.conn.release();
    }
  }

  async updateProfile(
    id: number,
    data: { full_name?: string; profile_image?: string | null; gamer_tag?: string; email?: string },
  ): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const fields: string[] = [];
      const params: (string | null | number)[] = [];
      if (data.full_name !== undefined) {
        fields.push("full_name = ?");
        params.push(data.full_name);
      }
      if (data.profile_image !== undefined) {
        fields.push("profile_image = ?");
        params.push(data.profile_image);
      }
      if (data.gamer_tag !== undefined) {
        fields.push("gamer_tag = ?");
        params.push(data.gamer_tag);
      }
      if (data.email !== undefined) {
        fields.push("email = ?");
        params.push(data.email);
      }
      if (fields.length === 0) return true;
      params.push(id);
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
        params,
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("UserRepository", "updateProfile failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }

  async changeRole(id: number, role: string): Promise<boolean> {
    const res = await this.db.getWriteConnection();
    if (!res) return false;
    try {
      const [result] = await res.conn.execute<ResultSetHeader>(
        `UPDATE users SET role = ? WHERE id = ?`,
        [role, id],
      );
      return result.affectedRows > 0;
    } catch (err) {
      this.logger.error("UserRepository", "changeRole failed", err as Error);
      return false;
    } finally {
      res.conn.release();
    }
  }
}
