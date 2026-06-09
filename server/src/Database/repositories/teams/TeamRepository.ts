import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { DbManager } from "../../connection/DbConnectionPool";

type DbParam = string | number | null;
type InvitationStatus = "accepted" | "rejected";

export class TeamRepository {
  public constructor(private readonly db: DbManager) {}

  private async selectRows(sql: string, params: DbParam[]): Promise<RowDataPacket[]> {
    const readConnection = await this.db.getReadConnection();

    if (!readConnection) {
      return [];
    }

    try {
      const [rows] = await readConnection.conn.execute<RowDataPacket[]>(sql, params);
      return rows;
    } finally {
      readConnection.conn.release();
    }
  }

  private async executeWrite(sql: string, params: DbParam[]): Promise<ResultSetHeader | null> {
    const writeConnection = await this.db.getWriteConnection();

    if (!writeConnection) {
      return null;
    }

    try {
      const [result] = await writeConnection.conn.execute<ResultSetHeader>(sql, params);
      return result;
    } finally {
      writeConnection.conn.release();
    }
  }

  async createTeam(
    name: string,
    tag: string,
    description: string | null,
    userId: number
  ): Promise<number | null> {
    const writeConnection = await this.db.getWriteConnection();

    if (!writeConnection) {
      return null;
    }

    try {
      await writeConnection.conn.beginTransaction();

      const [teamResult] = await writeConnection.conn.execute<ResultSetHeader>(
        `INSERT INTO teams (name, tag, description, created_by, captain_id)
         VALUES (?, ?, ?, ?, ?)`,
        [name, tag, description, userId, userId]
      );

      const teamId = teamResult.insertId;

      await writeConnection.conn.execute<ResultSetHeader>(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES (?, ?, 'captain')`,
        [teamId, userId]
      );

      await writeConnection.conn.commit();
      return teamId;
} catch (error) {
  console.error("CREATE TEAM DB ERROR:", error);
  await writeConnection.conn.rollback();
  return null;
} finally {
  writeConnection.conn.release();
}
  }

  async getUserTeams(userId: number): Promise<RowDataPacket[]> {
    return this.selectRows(
      `SELECT t.*
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = ?`,
      [userId]
    );
  }

  async getTeamById(teamId: number): Promise<RowDataPacket | null> {
    const rows = await this.selectRows(
      `SELECT *
       FROM teams
       WHERE id = ?`,
      [teamId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async deleteTeam(teamId: number): Promise<boolean> {
    const result = await this.executeWrite(
      `DELETE FROM teams
       WHERE id = ?`,
      [teamId]
    );

    return result !== null && result.affectedRows > 0;
  }

  async updateTeam(
    teamId: number,
    name: string,
    tag: string,
    description: string | null
  ): Promise<boolean> {
    const result = await this.executeWrite(
      `UPDATE teams
       SET name = ?, tag = ?, description = ?
       WHERE id = ?`,
      [name, tag, description, teamId]
    );

    return result !== null && result.affectedRows > 0;
  }

  async getTeamMembers(teamId: number): Promise<RowDataPacket[]> {
    return this.selectRows(
      `SELECT tm.team_id, tm.user_id, tm.role, tm.joined_at,
              u.gamer_tag, u.full_name, u.profile_image
       FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = ?`,
      [teamId]
    );
  }

  async isCaptain(teamId: number, userId: number): Promise<boolean> {
    const rows = await this.selectRows(
      `SELECT team_id
 FROM team_members
 WHERE team_id = ? AND user_id = ? AND role = 'captain'`,
      [teamId, userId]
    );

    return rows.length > 0;
  }

 async isMember(teamId: number, userId: number): Promise<boolean> {
    const rows = await this.selectRows(
    `SELECT team_id
 FROM team_members
 WHERE team_id = ? AND user_id = ?`,
      [teamId, userId]
    );

    return rows.length > 0;
  }

  async createInvitation(
    teamId: number,
    invitedUserId: number,
    invitedByUserId: number
  ): Promise<number | null> {
    const result = await this.executeWrite(
      `INSERT INTO team_invitations (team_id, invited_user_id, invited_by_user_id)
       VALUES (?, ?, ?)`,
      [teamId, invitedUserId, invitedByUserId]
    );

    return result ? result.insertId : null;
  }

  async getPendingInvitation(
    teamId: number,
    invitedUserId: number
  ): Promise<RowDataPacket | null> {
    const rows = await this.selectRows(
      `SELECT *
       FROM team_invitations
       WHERE team_id = ? AND invited_user_id = ? AND status = 'pending'`,
      [teamId, invitedUserId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async respondToInvitation(
    invitationId: number,
    status: InvitationStatus
  ): Promise<boolean> {
    const result = await this.executeWrite(
      `UPDATE team_invitations
       SET status = ?, responded_at = NOW()
       WHERE id = ? AND status = 'pending'`,
      [status, invitationId]
    );

    return result !== null && result.affectedRows > 0;
  }

  async addMember(teamId: number, userId: number): Promise<boolean> {
    const result = await this.executeWrite(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES (?, ?, 'member')`,
      [teamId, userId]
    );

    return result !== null && result.affectedRows > 0;
  }

  async removeMember(teamId: number, userId: number): Promise<boolean> {
    const result = await this.executeWrite(
      `DELETE FROM team_members
       WHERE team_id = ? AND user_id = ?`,
      [teamId, userId]
    );

    return result !== null && result.affectedRows > 0;
  }

  async transferCaptain(
    teamId: number,
    oldCaptainId: number,
    newCaptainId: number
  ): Promise<boolean> {
    const writeConnection = await this.db.getWriteConnection();

    if (!writeConnection) {
      return false;
    }

    try {
      await writeConnection.conn.beginTransaction();

      await writeConnection.conn.execute<ResultSetHeader>(
        `UPDATE team_members
         SET role = 'member'
         WHERE team_id = ? AND user_id = ?`,
        [teamId, oldCaptainId]
      );

      await writeConnection.conn.execute<ResultSetHeader>(
        `UPDATE team_members
         SET role = 'captain'
         WHERE team_id = ? AND user_id = ?`,
        [teamId, newCaptainId]
      );

      const [teamResult] = await writeConnection.conn.execute<ResultSetHeader>(
        `UPDATE teams
         SET captain_id = ?
         WHERE id = ?`,
        [newCaptainId, teamId]
      );

      await writeConnection.conn.commit();
      return teamResult.affectedRows > 0;
    } catch {
      await writeConnection.conn.rollback();
      return false;
    } finally {
      writeConnection.conn.release();
    }
  }

  async getInvitationById(invitationId: number): Promise<RowDataPacket | null> {
    const rows = await this.selectRows(
      `SELECT *
       FROM team_invitations
       WHERE id = ?`,
      [invitationId]
    );

    return rows.length > 0 ? rows[0] : null;
  }
  async getMyInvitations(userId: number): Promise<RowDataPacket[]> {
  return this.selectRows(
    `SELECT ti.id, ti.team_id, ti.created_at,
            t.name AS team_name, t.tag AS team_tag,
            u.gamer_tag AS invited_by
     FROM team_invitations ti
     JOIN teams t ON t.id = ti.team_id
     JOIN users u ON u.id = ti.invited_by_user_id
     WHERE ti.invited_user_id = ? AND ti.status = 'pending'`,
    [userId]
  );
}
}