export type TeamMemberRole = "captain" | "member";

export type TeamMemberDto = {
  team_id: number;
  user_id: number;
  role: TeamMemberRole;
  joined_at: string;
  gamer_tag: string;
  full_name: string;
  profile_image: string | null;
};

export type TeamDto = {
  id: number;
  name: string;
  tag: string;
  description: string | null;
  created_by: number;
  captain_id: number;
  created_at: string;
  members?: TeamMemberDto[];
};

export type CreateTeamDto = {
  name: string;
  tag: string;
  description: string | null;
};

export type ApiResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
};
