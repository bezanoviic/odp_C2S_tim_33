import { Request, Response } from "express";
import { TeamService } from "../../Services/teams/TeamService";

type AuthenticatedRequest = Request & {
  user: {
    id: number;
  };
};

type InvitationStatus = "accepted" | "rejected";

function isValidId(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function isValidTeamName(value: string): boolean {
  return value.trim().length >= 2 && value.trim().length <= 80;
}

function isValidTeamTag(value: string): boolean {
  return /^[A-Z0-9]{2,6}$/.test(value);
}

function isValidDescription(value: string | null): boolean {
  return value === null || value.trim().length <= 255;
}

function isValidInvitationStatus(value: string): value is InvitationStatus {
  return value === "accepted" || value === "rejected";
}

export class TeamController {
  public constructor(private readonly service: TeamService) {}

  async createTeam(req: Request, res: Response): Promise<void> {
    const { name, tag, description } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;

    if (
      typeof name !== "string" ||
      typeof tag !== "string" ||
      (description !== null && description !== undefined && typeof description !== "string")
    ) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const normalizedDescription = description ?? null;

    if (!isValidTeamName(name)) {
      res.status(400).json({ error: "Team name must be between 2 and 80 characters" });
      return;
    }

    if (!isValidTeamTag(tag)) {
      res.status(400).json({ error: "Team tag must contain 2 to 6 uppercase letters or numbers" });
      return;
    }

    if (!isValidDescription(normalizedDescription)) {
      res.status(400).json({ error: "Description must be up to 255 characters" });
      return;
    }

    const normalizedTag = tag.trim().toUpperCase();
    const existingTeam = await this.service.getTeamByTag(normalizedTag);
    if (existingTeam) {
      res.status(409).json({ error: "Team tag is already taken" });
      return;
    }

    const teamId = await this.service.createTeam(
      name.trim(),
      normalizedTag,
      normalizedDescription,
      userId
    );

    if (!teamId) {
      res.status(500).json({ error: "Team could not be created" });
      return;
    }

    res.status(201).json({ teamId });
  }

  async getMyTeams(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthenticatedRequest).user.id;
    const teams = await this.service.getMyTeams(userId);

    res.json(teams);
  }

  async getTeam(req: Request, res: Response): Promise<void> {
    const teamId = Number(req.params.id);

    if (!isValidId(teamId)) {
      res.status(400).json({ error: "Invalid team id" });
      return;
    }

    const team = await this.service.getTeam(teamId);

    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    res.json(team);
  }

  async deleteTeam(req: Request, res: Response): Promise<void> {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;

    if (!isValidId(teamId)) {
      res.status(400).json({ error: "Invalid team id" });
      return;
    }

    const deleted = await this.service.deleteTeam(teamId, userId);

    if (!deleted) {
      res.status(403).json({ error: "Only captain can delete team" });
      return;
    }

    res.status(204).send();
  }

  async inviteUser(req: Request, res: Response): Promise<void> {
    const teamId = Number(req.params.id);
    const invitedUserId = Number(req.body.invitedUserId);
    const userId = (req as AuthenticatedRequest).user.id;

    if (!isValidId(teamId)) {
      res.status(400).json({ error: "Invalid team id" });
      return;
    }

    if (!isValidId(invitedUserId)) {
      res.status(400).json({ error: "Invalid invited user id" });
      return;
    }

    const inviteId = await this.service.inviteUser(teamId, invitedUserId, userId);

    if (!inviteId) {
      res.status(400).json({ error: "Invitation could not be created" });
      return;
    }

    res.status(201).json({ inviteId });
  }

  async respondToInvite(req: Request, res: Response): Promise<void> {
    const invitationId = Number(req.body.invitationId);
    const status = String(req.body.status);
    const userId = (req as AuthenticatedRequest).user.id;

    if (!isValidId(invitationId)) {
      res.status(400).json({ error: "Invalid invitation id" });
      return;
    }

    if (!isValidInvitationStatus(status)) {
      res.status(400).json({ error: "Invalid invitation status" });
      return;
    }

    const success = await this.service.respondToInvite(invitationId, userId, status);

    if (!success) {
      res.status(400).json({ error: "Invitation could not be resolved" });
      return;
    }

    res.status(200).json({ success: true });
  }

  async updateTeam(req: Request, res: Response): Promise<void> {
    const teamId = Number(req.params.id);
    const { name, tag, description } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;

    if (!isValidId(teamId)) {
      res.status(400).json({ error: "Invalid team id" });
      return;
    }

    if (
      typeof name !== "string" ||
      typeof tag !== "string" ||
      (description !== null && description !== undefined && typeof description !== "string")
    ) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const normalizedDescription = description ?? null;

    if (!isValidTeamName(name)) {
      res.status(400).json({ error: "Team name must be between 2 and 80 characters" });
      return;
    }

    if (!isValidTeamTag(tag)) {
      res.status(400).json({ error: "Team tag must contain 2 to 6 uppercase letters or numbers" });
      return;
    }

    if (!isValidDescription(normalizedDescription)) {
      res.status(400).json({ error: "Description must be up to 255 characters" });
      return;
    }

    const success = await this.service.updateTeam(
      teamId,
      name.trim(),
      tag.trim(),
      normalizedDescription,
      userId
    );

    if (!success) {
      res.status(403).json({ error: "Only captain can update team" });
      return;
    }

    res.status(200).json({ success: true });
  }

  async getTeamMembers(req: Request, res: Response): Promise<void> {
    const teamId = Number(req.params.id);

    if (!isValidId(teamId)) {
      res.status(400).json({ error: "Invalid team id" });
      return;
    }

    const members = await this.service.getTeamMembers(teamId);

    res.json(members);
  }

  async leaveTeam(req: Request, res: Response): Promise<void> {
    const teamId = Number(req.params.id);
    const userId = (req as AuthenticatedRequest).user.id;

    if (!isValidId(teamId)) {
      res.status(400).json({ error: "Invalid team id" });
      return;
    }

    const success = await this.service.leaveTeam(teamId, userId);

    if (!success) {
      res.status(400).json({ error: "Captain must transfer ownership before leaving team" });
      return;
    }

    res.status(200).json({ success: true });
  }

  async kickMember(req: Request, res: Response): Promise<void> {
    const teamId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);
    const captainId = (req as AuthenticatedRequest).user.id;

    if (!isValidId(teamId) || !isValidId(targetUserId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const success = await this.service.kickMember(teamId, targetUserId, captainId);

    if (!success) {
      res.status(403).json({ error: "Only captain can remove members" });
      return;
    }

    res.status(200).json({ success: true });
  }

  async transferCaptain(req: Request, res: Response): Promise<void> {
    const teamId = Number(req.params.id);
    const newCaptainId = Number(req.body.newCaptainId);
    const oldCaptainId = (req as AuthenticatedRequest).user.id;

    if (!isValidId(teamId) || !isValidId(newCaptainId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const success = await this.service.transferCaptain(teamId, oldCaptainId, newCaptainId);

    if (!success) {
      res.status(400).json({ error: "Captain transfer could not be completed" });
      return;
    }

    res.status(200).json({ success: true });
  }
  async getMyInvitations(req: Request, res: Response): Promise<void> {
  const userId = (req as AuthenticatedRequest).user.id;
  const invitations = await this.service.getMyInvitations(userId);
  res.json(invitations);
}
}
