import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Message } from './message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])], // ✅ Asegurar que el repositorio esté disponible
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService], // ✅ Exportar para otros módulos si es necesario
})
export class MessagesModule {}
