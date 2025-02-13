import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async createUser(phone: string): Promise<User> {
    const newUser = this.userRepository.create({ phone });
    return this.userRepository.save(newUser);
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
