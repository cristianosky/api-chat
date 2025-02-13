import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async saveMessage(data: Partial<Message>): Promise<Message> {
    const newMessage = this.messageRepository.create(data);
    return this.messageRepository.save(newMessage);
  }

  async getMessagesForUser(phone: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: [{ sender: phone }, { receiver: phone }],
      order: { timestamp: 'ASC' },
    });
  }
}
