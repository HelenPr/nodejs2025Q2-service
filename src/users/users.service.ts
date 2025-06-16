import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  private mapToResponse(user: any): UserResponse {
    const { ...userResponse } = user;
    return userResponse;
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.mapToResponse(user));
  }

  async getUserById(id: string): Promise<UserResponse> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToResponse(user);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponse> {
    const { login, password } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        login,
        password: hashedPassword,
      },
    });

    return this.mapToResponse(newUser);
  }

  async updateUserPassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserResponse> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      10,
    );

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
        version: { increment: 1 },
      },
    });

    return this.mapToResponse(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
