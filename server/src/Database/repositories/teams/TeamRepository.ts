import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { masterPool } from "../../connection/DbConnectionPool";

export class TeamRepository {
  async createTeam(
    name: string,
    tag: string,
    description: string | null,
    userId: number
  ): Promise<number> {
    const [result] = await masterPool.execute<ResultSetHeader>(
      `INSERT INTO teams (name, tag, description, created_by, captain_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, tag, description, userId, userId]
    );

    const teamId = result.insertId;

    await masterPool.execute<ResultSetHeader>(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES (?, ?, 'captain')`,
      [teamId, userId]
    );

    return teamId;
  }

  async getUserTeams(userId: number): Promise<RowDataPacket[]> {
    const [rows] = await masterPool.execute<RowDataPacket[]>(
      `SELECT t.*
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = ?`,
      [userId]
    );

    return rows;
  }

  async getTeamById(teamId: number): Promise<RowDataPacket | null> {
    const [rows] = await masterPool.execute<RowDataPacket[]>(
      `SELECT *
       FROM teams
       WHERE id = ?`,
      [teamId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async deleteTeam(teamId: number): Promise<void> {
    await masterPool.execute<ResultSetHeader>(
      `DELETE FROM teams
       WHERE id = ?`,
      [teamId]
    );
  }
    async updateTeam(
    teamId: number,
    name: string,
    tag: string,
    description: string | null
  ): Promise<void> {
    await masterPool.execute<ResultSetHeader>(
      `UPDATE teams
       SET name = ?, tag = ?, description = ?
       WHERE id = ?`,
      [name, tag, description, teamId]
    );
  }

  async getTeamMembers(teamId: number): Promise<RowDataPacket[]> {
    const [rows] = await masterPool.execute<RowDataPacket[]>(
      `SELECT tm.team_id, tm.user_id, tm.role, tm.joined_at,
              u.gamer_tag, u.full_name, u.profile_image
       FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = ?`,
      [teamId]
    );

    return rows;
  }

  async isCaptain(teamId: number, userId: number): Promise<boolean> {
    const [rows] = await masterPool.execute<RowDataPacket[]>(
      `SELECT *
       FROM team_members
       WHERE team_id = ? AND user_id = ? AND role = 'captain'`,
      [teamId, userId]
    );

    return rows.length > 0;
  }

  async isMember(teamId: number, userId: number): Promise<boolean> {
    const [rows] = await masterPool.execute<RowDataPacket[]>(
      `SELECT *
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
  ): Promise<number> {
    const [result] = await masterPool.execute<ResultSetHeader>(
      `INSERT INTO team_invitations (team_id, invited_user_id, invited_by_user_id)
       VALUES (?, ?, ?)`,
      [teamId, invitedUserId, invitedByUserId]
    );

    return result.insertId;
  }

  async getPendingInvitation(teamId: number, invitedUserId: number): Promise<RowDataPacket | null> {
    const [rows] = await masterPool.execute<RowDataPacket[]>(
      `SELECT *
       FROM team_invitations
       WHERE team_id = ? AND invited_user_id = ? AND status = 'pending'`,
      [teamId, invitedUserId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async respondToInvitation(
    invitationId: number,
    status: "accepted" | "rejected"
  ): Promise<void> {
    await masterPool.execute<ResultSetHeader>(
      `UPDATE team_invitations
       SET status = ?, responded_at = NOW()
       WHERE id = ?`,
      [status, invitationId]
    );
  }

  async addMember(teamId: number, userId: number): Promise<void> {
    await masterPool.execute<ResultSetHeader>(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES (?, ?, 'member')`,
      [teamId, userId]
    );
  }

  async removeMember(teamId: number, userId: number): Promise<void> {
    await masterPool.execute<ResultSetHeader>(
      `DELETE FROM team_members
       WHERE team_id = ? AND user_id = ?`,
      [teamId, userId]
    );
  }

  async transferCaptain(teamId: number, oldCaptainId: number, newCaptainId: number): Promise<void> {
    await masterPool.execute<ResultSetHeader>(
      `UPDATE team_members
       SET role = 'member'
       WHERE team_id = ? AND user_id = ?`,
      [teamId, oldCaptainId]
    );

    await masterPool.execute<ResultSetHeader>(
      `UPDATE team_members
       SET role = 'captain'
       WHERE team_id = ? AND user_id = ?`,
      [teamId, newCaptainId]
    );

    await masterPool.execute<ResultSetHeader>(
      `UPDATE teams
       SET captain_id = ?
       WHERE id = ?`,
      [newCaptainId, teamId]
    );
  }
}