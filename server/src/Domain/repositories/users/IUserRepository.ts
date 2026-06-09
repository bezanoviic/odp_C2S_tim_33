import { User } from "../../models/User";

export interface IUserRepository {
  findById(id: number):           Promise<User>;
  findByGamerTag(tag: string):    Promise<User>;
  findByEmail(email: string):     Promise<User>;
  findAll():                      Promise<User[]>;
  create(user: User):             Promise<User>;
  update(user: User):             Promise<boolean>;
  changeRole(id: number, role: string): Promise<boolean>;
}
