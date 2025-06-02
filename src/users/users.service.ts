import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User, UserResponse } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  private users: User[] = [];

  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  private mapToResponse(user: User): UserResponse {
    const { password, ...userResponse } = user;
    return userResponse;
  }

  getAllUsers(): UserResponse[] {
    return this.users.map(user => this.mapToResponse(user));
  }

  getUserById(id: string): UserResponse {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToResponse(user);
  }

  createUser(createUserDto: CreateUserDto): UserResponse {
    const { login, password } = createUserDto;
    
    const newUser: User = {
      id: randomUUID(),
      login,
      password,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.users.push(newUser);
    return this.mapToResponse(newUser);
  }

  updateUserPassword(id: string, updatePasswordDto: UpdatePasswordDto): UserResponse {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    const user = this.users[userIndex];
    if (user.password !== updatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const updatedUser = {
      ...user,
      password: updatePasswordDto.newPassword,
      version: user.version + 1,
      updatedAt: Date.now(),
    };

    this.users[userIndex] = updatedUser;
    return this.mapToResponse(updatedUser);
  }

  deleteUser(id: string): void {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    this.users.splice(userIndex, 1);
  }
} 
