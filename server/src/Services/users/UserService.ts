import { IUserService }    from "../../Domain/services/users/IUserService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { UserDto }         from "../../Domain/DTOs/users/UserDto";

export class UserService implements IUserService {
  public constructor(private readonly userRepo: IUserRepository) {}

  async getAll(): Promise<UserDto[]> {
    const users = await this.userRepo.findAll();
    return users.map((u) => new UserDto(u.id, u.gamer_tag, u.full_name, u.email, u.role, u.profile_image));
  }

  async getById(id: number): Promise<UserDto | null> {
    const u = await this.userRepo.findById(id);
    if (u.id === 0) return null;
    return new UserDto(u.id, u.gamer_tag, u.full_name, u.email, u.role, u.profile_image);
  }

  async searchByGamerTag(query: string): Promise<UserDto[]> {
    const users = await this.userRepo.searchByGamerTag(query);
    return users.map((u) => new UserDto(u.id, u.gamer_tag, u.full_name, u.email, u.role, u.profile_image));
  }

  async findByGamerTag(gamer_tag: string): Promise<UserDto | null> {
    const u = await this.userRepo.findByGamerTag(gamer_tag);
    if (u.id === 0) return null;
    return new UserDto(u.id, u.gamer_tag, u.full_name, u.email, u.role, u.profile_image);
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const u = await this.userRepo.findByEmail(email);
    if (u.id === 0) return null;
    return new UserDto(u.id, u.gamer_tag, u.full_name, u.email, u.role, u.profile_image);
  }

  updateProfile(id: number, data: { full_name?: string; profile_image?: string | null; gamer_tag?: string; email?: string }): Promise<boolean> {
    return this.userRepo.updateProfile(id, data);
  }

  changeRole(id: number, role: string): Promise<boolean> {
    return this.userRepo.changeRole(id, role);
  }
}