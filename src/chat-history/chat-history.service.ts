import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';

@Injectable()
export class ChatHistoryService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  async getChatHistory(chatroomId: number) {
    const result = await this.prismaService.chatHistory.findMany({
      where: {
        chatroomId,
      },
    });
    const res: Record<string, any>[] = [];
    for (let i = 0; i < history.length; i++) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: history[i].senderId,
        },
        select: {
          id: true,
          username: true,
          nickname: true,
          email: true,
          headPic: true,
        },
      });
      res.push({
        ...result[i],
        sender: user,
      });
    }
    return result;
  }

  async createChatHistory(createChatHistoryDto: CreateChatHistoryDto) {
    const result = await this.prismaService.chatHistory.create({
      data: createChatHistoryDto,
    });
    return result;
  }
}
