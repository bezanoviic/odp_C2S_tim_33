import { User } from "../../models/User";

export interface IUserRepository {
  findById(id: number):            Promise<User>;
  findByGamerTag(tag: string):     Promise<User>;
  findByEmail(email: string):      Promise<User>;
  findAll():                       Promise<User[]>;
  searchByGamerTag(query: string): Promise<User[]>;
  create(user: User):              Promise<User>;
  updateProfile(id: number, data: { full_name?: string; profile_image?: string | null; gamer_tag?: string; email?: string }): Promise<boolean>;
  changeRole(id: number, role: string): Promise<boolean>;
}