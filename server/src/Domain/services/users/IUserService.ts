import { UserDto } from "../../DTOs/users/UserDto";

export interface IUserService {
  getAll():                             Promise<UserDto[]>;
  getById(id: number):                  Promise<UserDto | null>;
  searchByGamerTag(query: string):      Promise<UserDto[]>;
  findByGamerTag(gamer_tag: string):    Promise<UserDto | null>;
  findByEmail(email: string):           Promise<UserDto | null>;
  updateProfile(id: number, data: { full_name?: string; profile_image?: string | null; gamer_tag?: string; email?: string }): Promise<boolean>;
  changeRole(id: number, role: string): Promise<boolean>;
}