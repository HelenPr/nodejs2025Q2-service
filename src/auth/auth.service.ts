import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Tokens, JwtPayload } from './interfaces/tokens.interface';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(signupDto: SignupDto): Promise<void> {
    const { login, password } = signupDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { login },
    });
    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    await this.usersService.createUser({ login, password });
  }

  async login(loginDto: LoginDto): Promise<Tokens> {
    const { login, password } = loginDto;

    const user = await this.prisma.user.findFirst({
      where: { login },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.login);
  }

  async refresh(refreshDto: RefreshDto): Promise<Tokens> {
    const { refreshToken } = refreshDto;

    try {
      const payload = this.verifyRefreshToken(refreshToken);
      
      return this.generateTokens(payload.userId, payload.login);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(userId: string, login: string): Tokens {
    const payload: JwtPayload = { userId, login };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateAccessToken(payload: JwtPayload): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    const expiresIn = process.env.JWT_ACCESS_EXPIRATION || '15m';

    return `access_${payload.userId}_${payload.login}`;
  }

  private generateRefreshToken(payload: JwtPayload): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    const expiresIn = process.env.JWT_REFRESH_EXPIRATION || '7d';

    return `refresh_${payload.userId}_${payload.login}`;
  }

  private verifyRefreshToken(token: string): JwtPayload {
    if (!token.startsWith('refresh_')) {
      throw new Error('Invalid refresh token');
    }

    const [, userId, login] = token.split('_');
    return { userId, login };
  }
} 
