import { UserRole } from "../enums/UserRole";

export class User {
  constructor(
    public id:            number    = 0,
    public gamer_tag:     string    = "",
    public full_name:     string    = "",
    public email:         string    = "",
    public role:          UserRole  = UserRole.PLAYER,
    public password_hash: string    = "",
    public profile_image: string | null = null,
  ) {}
}
