import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { ChatHistoryService } from 'src/chat-history/chat-history.service';
import { Inject } from '@nestjs/common';

interface JoinRoomPayload {
  chatroomId: number;
  userId: number;
}
interface LeaveRoomPayload {
  chatroomId: number;
  userId: number;
}
interface SendMessagePayload {
  senderId: number;
  chatroomId: number;
  message: {
    type: 'text' | 'image';
    content: string;
  };
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @Inject(ChatHistoryService)
  private readonly chatHistoryService: ChatHistoryService;

  @WebSocketServer() server: Server;

  @SubscribeMessage('joinRoom')
  joinRoom(client: Socket, payload: JoinRoomPayload) {
    const chatroomId = payload.chatroomId.toString();
    client.join(chatroomId);
    this.server.to(chatroomId).emit('message', {
      type: 'joinRoom',
      senderId: payload.userId,
      time: Date.now(),
    });
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(client: Socket, payload: LeaveRoomPayload) {
    const chatroomId = payload.chatroomId.toString();
    client.join(chatroomId);
    this.server.to(chatroomId).emit('message', {
      type: 'leaveRoom',
      senderId: payload.userId,
      time: Date.now(),
      chatroomId: payload.chatroomId,
    });
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(@MessageBody() payload: SendMessagePayload) {
    const chatroomId = payload.chatroomId.toString();
    await this.chatHistoryService.createChatHistory({
      content: payload.message.content,
      type: payload.message.type === 'image' ? 1 : 0,
      chatroomId: payload.chatroomId,
      senderId: payload.senderId,
    });

    this.server.to(chatroomId).emit('message', {
      type: 'sendMessage',
      senderId: payload.senderId,
      message: payload.message,
      time: Date.now(),
    });
  }
}
