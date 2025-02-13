// backend-mensajeria/src/users/users.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':phone')
  async getUser(@Param('phone') phone: string): Promise<User | null> {
    return this.usersService.findByPhone(phone);
  }
}