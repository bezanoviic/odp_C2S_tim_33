import { Request, Response } from "express";
import { TeamService } from "../../Services/teams/TeamService";

type AuthenticatedRequest = Request & {
  user: {
    id: number;
  };
};

const service = new TeamService();

function getErrorMessage(error: Error): string {
  return error.message || "Unexpected error";
}

export class TeamController {
  async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const { name, tag, description } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      const teamId = await service.createTeam(name, tag, description, userId);

      res.status(201).json({ teamId });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

  async getMyTeams(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;

      const teams = await service.getMyTeams(userId);

      res.json(teams);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

  async getTeam(req: Request, res: Response): Promise<void> {
    try {
      const teamId = Number(req.params.id);

      const team = await service.getTeam(teamId);

      res.json(team);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

  async deleteTeam(req: Request, res: Response): Promise<void> {
    try {
      const teamId = Number(req.params.id);

      await service.deleteTeam(teamId, req.user!.id);

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

  async inviteUser(req: Request, res: Response): Promise<void> {
    try {
      const teamId = Number(req.params.id);
      const { invitedUserId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      const inviteId = await service.inviteUser(teamId, invitedUserId, userId);

      res.status(201).json({ inviteId });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

  async respondToInvite(req: Request, res: Response): Promise<void> {
    try {
      const { invitationId, status } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      await service.respondToInvite(invitationId, userId, status);

      res.status(200).send();
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

    async updateTeam(req: Request, res: Response): Promise<void> { 
    try {
      const teamId = Number(req.params.id);
      const { name, tag, description } = req.body;

      await service.updateTeam(teamId, name, tag, description, req.user!.id);

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

  async getTeamMembers(req: Request, res: Response): Promise<void> {
    try {
      const teamId = Number(req.params.id);

      const members = await service.getTeamMembers(teamId);

      res.json(members);
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

  async leaveTeam(req: Request, res: Response): Promise<void> {
    try {
      const teamId = Number(req.params.id);
      const userId = (req as AuthenticatedRequest).user.id;

      await service.leaveTeam(teamId, userId);

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

  async kickMember(req: Request, res: Response): Promise<void> {
    try {
      const teamId = Number(req.params.id);
      const targetUserId = Number(req.params.userId);
      const captainId = (req as AuthenticatedRequest).user.id;

      await service.kickMember(teamId, targetUserId, captainId);

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }

  async transferCaptain(req: Request, res: Response): Promise<void> {
    try {
      const teamId = Number(req.params.id);
      const { newCaptainId } = req.body;
      const oldCaptainId = (req as AuthenticatedRequest).user.id;

      await service.transferCaptain(teamId, oldCaptainId, newCaptainId);

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: getErrorMessage(error as Error) });
    }
  }
}