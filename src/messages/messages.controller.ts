import { Controller, Get, Post, Body } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // @Get()
  // // getAllMessages(): Promise<Message[]> {
  // //   return this.messagesService.getMessages();
  // // }

  // @Post()
  // createMessage(@Body() message: any): Promise<Message> {
  //   return this.messagesService.sendMessage(message);
  // }
}
