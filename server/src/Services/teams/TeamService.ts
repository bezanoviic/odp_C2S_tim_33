import { TeamRepository } from "../../Database/repositories/teams/TeamRepository";

export class TeamService {
  private repo = new TeamRepository();

  async createTeam(name: string, tag: string, description: string | null, userId: number) {
    return this.repo.createTeam(name, tag, description, userId);
  }

  async getMyTeams(userId: number) {
    return this.repo.getUserTeams(userId);
  }

  async getTeam(teamId: number) {
    return this.repo.getTeamById(teamId);
  }

 async deleteTeam(teamId: number, userId: number) {
  const isCaptain = await this.repo.isCaptain(teamId, userId);
  if (!isCaptain) {
    throw new Error("Only captain can delete team");
  }

  return this.repo.deleteTeam(teamId);
}

  async inviteUser(teamId: number, invitedUserId: number, invitedByUserId: number) {
    const isCaptain = await this.repo.isCaptain(teamId, invitedByUserId);
    if (!isCaptain) {
      throw new Error("Only captain can invite players");
    }

    const isMember = await this.repo.isMember(teamId, invitedUserId);
    if (isMember) {
      throw new Error("User is already in team");
    }

    const existingInvite = await this.repo.getPendingInvitation(teamId, invitedUserId);
    if (existingInvite) {
      throw new Error("Invitation already exists");
    }

    return this.repo.createInvitation(teamId, invitedUserId, invitedByUserId);
  }

 async respondToInvite(
  invitationId: number,
  userId: number,
  status: "accepted" | "rejected"
) {
  const invitation = await this.repo.getInvitationById(invitationId);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.invited_user_id !== userId) {
    throw new Error("You can only respond to your own invitations");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation is already resolved");
  }

  await this.repo.respondToInvitation(invitationId, status);

  if (status === "accepted") {
    const isMember = await this.repo.isMember(invitation.team_id, userId);
    if (!isMember) {
      await this.repo.addMember(invitation.team_id, userId);
    }
  }
}

 async leaveTeam(teamId: number, userId: number) {
  const isCaptain = await this.repo.isCaptain(teamId, userId);
  if (isCaptain) {
    throw new Error("Captain must transfer ownership before leaving team");
  }

  return this.repo.removeMember(teamId, userId);
}

  async kickMember(teamId: number, targetUserId: number, captainId: number) {
    const isCaptain = await this.repo.isCaptain(teamId, captainId);
    if (!isCaptain) {
      throw new Error("Only captain can remove members");
    }

    return this.repo.removeMember(teamId, targetUserId);
  }

   async transferCaptain(teamId: number, oldCaptainId: number, newCaptainId: number) {
    const isCaptain = await this.repo.isCaptain(teamId, oldCaptainId);
    if (!isCaptain) {
      throw new Error("Only captain can transfer ownership");
    }

    const isMember = await this.repo.isMember(teamId, newCaptainId);
    if (!isMember) {
      throw new Error("New captain must be team member");
    }

    return this.repo.transferCaptain(teamId, oldCaptainId, newCaptainId);
  }

 async updateTeam(
  teamId: number,
  name: string,
  tag: string,
  description: string | null,
  userId: number
) {
  const isCaptain = await this.repo.isCaptain(teamId, userId);
  if (!isCaptain) {
    throw new Error("Only captain can update team");
  }

  return this.repo.updateTeam(teamId, name, tag, description);
}

  async getTeamMembers(teamId: number) {
    return this.repo.getTeamMembers(teamId);
  }
}