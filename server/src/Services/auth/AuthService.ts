import { UserLoginDto } from "../../Domain/DTOs/auth/UserLoginDto";
import { UserRegisterDto } from "../../Domain/DTOs/auth/UserRegisterDto";
import { User } from "../../Domain/models/User";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IAuthService } from "../../Domain/services/auth/IAuthService";
import bcrypt from "bcryptjs";
import jwt, { SignOptions, Secret, JwtPayload } from "jsonwebtoken";

export class AuthService implements IAuthService {
  private readonly saltRounds: number;

  public constructor(private userRepository: IUserRepository) {
    this.saltRounds = parseInt(process.env.SALT_ROUNDS || "10", 10);
  }

  async login(email: string, password: string): Promise<UserLoginDto> {
    const user = await this.userRepository.getByEmail(email);

    if (user.id !== 0 && await bcrypt.compare(password, user.password)) {
      const token = this.generateToken(user);
      return new UserLoginDto(user.id, user.username, user.email, token);
    }

    return new UserLoginDto();
  }

  async register(data: UserRegisterDto): Promise<UserLoginDto> {
    const existingEmail = await this.userRepository.getByEmail(data.email);
    if (existingEmail.id !== 0) {
      return new UserLoginDto();
    }

    const existingUsername = await this.userRepository.getByUsername(data.username);
    if (existingUsername.id !== 0) {
      return new UserLoginDto();
    }

    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    const newUser = await this.userRepository.create(
      new User(0, data.username, data.email, hashedPassword)
    );

    if (newUser.id !== 0) {
      const token = this.generateToken(newUser);
      return new UserLoginDto(newUser.id, newUser.username, newUser.email, token);
    }

    return new UserLoginDto();
  }

  async validateToken(token: string): Promise<any> {
    try {
      const secret = process.env.JWT_SECRET ?? "";
      const decoded = jwt.verify(token, secret) as JwtPayload & { userId: number };
      const user = await this.userRepository.getById((decoded as any).userId);

      if (user.id !== 0) {
        return {
          id: user.id,
          username: user.username,
          email: user.email
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private generateToken(user: User): string {
    const secret: Secret = process.env.JWT_SECRET || "";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    const payload = { userId: user.id };
    const options: SignOptions = { expiresIn: expiresIn as any };
    return jwt.sign(payload, secret, options);
  }
}
