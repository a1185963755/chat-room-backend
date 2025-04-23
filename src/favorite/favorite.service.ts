import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  async list(userId: number) {
    const favorites = await this.prismaService.favorite.findMany({
      where: { userId },
    });
    const res: Record<string, any> = [];
    for (let i = 0; i < favorites.length; i++) {
      const chatHistory = await this.prismaService.chatHistory.findUnique({
        where: {
          id: favorites[i].chatHistoryId,
        },
      });
      const chatroom = await this.prismaService.chatroom.findUnique({
        where: { id: chatHistory!.chatroomId },
      });
      res.push({
        ...favorites[i],
        chatHistory,
        chatroom,
      });
    }
    return res;
  }

  async add(userId: number, chatHistoryId: number) {
    const isFound = await this.prismaService.favorite.findFirst({
      where: { userId, chatHistoryId },
    });
    if (isFound) {
      throw new HttpException('已收藏', HttpStatus.BAD_REQUEST);
    }
    const favorite = await this.prismaService.favorite.create({
      data: { userId, chatHistoryId },
    });
    return favorite;
  }

  async del(id: number) {
    const favorite = await this.prismaService.favorite.delete({
      where: { id },
    });
    return favorite;
  }
}
