import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class MessagesGateway {
  @WebSocketServer() server: Server;
  private clients = new Map<string, string>();

  constructor(private messagesService: MessagesService) {}

  // ✅ Cliente se conecta
  async handleConnection(client: Socket) {
    // console.log(`✅ Cliente conectado: ${client.id}`);
  }

  // ❌ Cliente se desconecta
  handleDisconnect(client: Socket) {
    const phone = [...this.clients.entries()].find(([_, id]) => id === client.id)?.[0];
    if (phone) {
      this.clients.delete(phone);
      // console.log(`❌ Cliente desconectado: ${phone}`);
    }
  }

  // 📩 Manejo de mensajes privados y guardado en DB
  @SubscribeMessage('message')
  async handleMessage(@MessageBody() message: Message, @ConnectedSocket() client: Socket) {
    await this.messagesService.saveMessage(message); // Guarda en DB

    const receiverSocketId = this.clients.get(message.receiver);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('message', message);
      // console.log(`✅ Mensaje enviado a ${message.receiver}`);
    } else {
      // console.log(`⚠️ Usuario ${message.receiver} no está conectado.`);
    }
  }

  // 📌 Usuario se registra en WebSocket y recibe sus mensajes previos
  @SubscribeMessage('register')
  async handleRegister(@MessageBody() data: { phone: string }, @ConnectedSocket() client: Socket) {
    this.clients.set(data.phone, client.id);
    client.emit('registered', { phone: data.phone });

    // Enviar mensajes previos al usuario
    const messages = await this.messagesService.getMessagesForUser(data.phone);
    client.emit('previousMessages', messages);
  }
}
