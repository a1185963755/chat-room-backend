import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatroomService {
  @Inject(PrismaService)
  private prismaService: PrismaService;
  async createOneToOneChatroom(friendId: number, userId: number) {
    const { id } = await this.prismaService.chatroom.create({
      data: {
        name: `chatroom-${Math.random().toString(36).substring(2)}`,
        type: 1,
      },
      select: {
        id: true,
      },
    });
    await this.prismaService.userChatroom.create({
      data: {
        userId,
        chatroomId: id,
      },
    });
    await this.prismaService.userChatroom.create({
      data: {
        userId: friendId,
        chatroomId: id,
      },
    });
    return '创建成功';
  }

  async createGroupChatroom(name: string, userId: number) {
    const { id } = await this.prismaService.chatroom.create({
      data: {
        name,
        type: 2,
      },
    });
    await this.prismaService.userChatroom.create({
      data: {
        userId,
        chatroomId: id,
      },
    });
    return '创建成功';
  }

  async getChatroomList(userId: number) {
    const userChatroomList = await this.prismaService.userChatroom.findMany({
      where: {
        userId,
      },
    });

    const chatroomList = await this.prismaService.chatroom.findMany({
      where: {
        id: {
          in: userChatroomList.map((item) => item.chatroomId),
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
    const res: Record<string, any>[] = [];
    for (const item of chatroomList) {
      const userChatrooms = await this.prismaService.userChatroom.findMany({
        where: {
          chatroomId: item.id,
        },
      });
      res.push({
        ...item,
        membersCount: userChatrooms.length,
        membersIds: userChatrooms.map((item) => item.userId),
      });
    }

    return res;
  }

  async getChatroomMembers(chatroomId: number) {
    const rooms = await this.prismaService.userChatroom.findMany({
      where: {
        chatroomId,
      },
      select: {
        userId: true,
      },
    });
    return await this.prismaService.user.findMany({
      where: {
        id: {
          in: rooms.map((item) => item.userId),
        },
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        headPic: true,
      },
    });
  }

  async getChatroomInfo(chatroomId: number) {
    const chatroom = await this.prismaService.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });
    if (!chatroom) {
      return null;
    }
    return {
      ...chatroom,
      members: await this.getChatroomMembers(chatroomId),
    };
  }

  async joinChatroom(chatroomId: number, userId: number) {
    const chatroom = await this.prismaService.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
    });
    if (!chatroom) {
      throw new HttpException('聊天室不存在', 404);
    }
    if (chatroom.type === 1) {
      throw new HttpException('无法加入单聊', 404);
    }
    const isInChatroom = await this.prismaService.userChatroom.findFirst({
      where: {
        userId,
        chatroomId,
      },
    });
    if (isInChatroom) {
      throw new HttpException('你已经在聊天室中', 404);
    }
    await this.prismaService.userChatroom.create({
      data: {
        userId,
        chatroomId,
      },
    });
    return '加入成功';
  }

  async quitChatroom(chatroomId: number, userId: number) {
    const chatroom = await this.prismaService.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
    });
    if (!chatroom) {
      throw new HttpException('聊天室不存在', 404);
    }
    if (chatroom.type === 1) {
      throw new HttpException('无法退出单聊', 404);
    }
    const isInChatroom = await this.prismaService.userChatroom.findFirst({
      where: {
        userId,
        chatroomId,
      },
    });
    if (!isInChatroom) {
      throw new HttpException('不在此聊天室', 404);
    }
    await this.prismaService.userChatroom.deleteMany({
      where: {
        userId,
        chatroomId,
      },
    });
    return '退出成功';
  }
}
