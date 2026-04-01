import { UserAuthDataDto } from "../../Domain/DTOs/auth/UserAuthDataDto";
import { User } from "../../Domain/models/User";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import bcrypt from "bcryptjs";

export class AuthService implements IAuthService {
  private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || "10", 10);

  public constructor(private userRepository: IUserRepository) {}

  async prijava(korisnickoIme: string, lozinka: string): Promise<UserAuthDataDto> {
    const user = await this.userRepository.getByUsername(korisnickoIme);

    if (user.id !== 0 && await bcrypt.compare(lozinka, user.lozinka)) {
      return new UserAuthDataDto(user.id, user.korisnickoIme, user.uloga);
    }

    return new UserAuthDataDto(); // Neispravno korisničko ime ili lozinka
  }

  async registracija(korisnickoIme: string, uloga: string, lozinka: string): Promise<UserAuthDataDto> {
    const existingUser = await this.userRepository.getByUsername(korisnickoIme);
    
    if (existingUser.id !== 0) {
      return new UserAuthDataDto(); // Korisnik već postoji
    }

    // Hash-ujemo lozinku pre čuvanja
    const hashedPassword = await bcrypt.hash(lozinka, this.saltRounds);

    const newUser = await this.userRepository.create(
      new User(0, korisnickoIme, uloga, hashedPassword)
    );

    if (newUser.id !== 0) {
      return new UserAuthDataDto(newUser.id, newUser.korisnickoIme, newUser.uloga);
    }

    return new UserAuthDataDto(); // Registracija nije uspela
  }
}
