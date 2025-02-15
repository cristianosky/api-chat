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
import * as jwt from 'jsonwebtoken';
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
    try {
      let token = client.handshake.auth.token; // Obtiene el token del handshake
      if (!token) throw new Error('No token');

      let decoded = jwt.verify(token, process.env.JWT_SECRET!); // Verifica el token
      // console.log('✅ Usuario autenticado:', decoded);
    } catch (error) {
      // console.error('❌ Token inválido:', error.message);

      // Pedir nuevo token al cliente
      client.emit('request_refresh_token');

      // Escuchar respuesta con el refresh token
      client.once('send_refresh_token', async (refreshToken) => {
        try {
          const newToken = await this.verifyRefreshToken(refreshToken);
          client.handshake.auth.token = newToken; // Actualizar token en el handshake
          // console.log('🔄 Token refrescado:', newToken);
          client.emit('token_refreshed', newToken);
        } catch (refreshError) {
          // console.error('❌ Refresh Token inválido:', refreshError.message);
          client.emit('error_401');
          client.disconnect();
        }
      });
    }
  }

  async verifyRefreshToken(data: any): Promise<string> {
    // Verifica el refresh token y genera un nuevo access token
    const phone = '+'+data.phone;
    const payload = jwt.verify(data.refreshToken, process.env.JWT_REFRESH_SECRET!)!;
    return jwt.sign({ phone }, process.env.JWT_SECRET!, { expiresIn: '7d' });
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
