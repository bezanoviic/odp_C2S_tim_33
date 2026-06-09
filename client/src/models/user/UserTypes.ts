export type UserDto = {
  id: number;
  gamer_tag: string;
  full_name: string;
  email: string;
  role: string;
  profile_image?: string | null;
  created_at?: string;
  isActive?: number | boolean;
};
