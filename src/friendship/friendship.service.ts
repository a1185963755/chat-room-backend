import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { FriendAddDto } from './dto/friend-add.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendUpdateDto } from './dto/friend-update.dto';

@Injectable()
export class FriendshipService {
  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

  async getFriendship(id: number) {
    const friends = await this.prismaService.friendship.findMany({
      where: {
        OR: [
          {
            userId: id,
          },
          {
            friendId: id,
          },
        ],
      },
    });
    const set = new Set<number>();
    for (let i = 0; i < friends.length; i++) {
      set.add(friends[i].userId);
      set.add(friends[i].friendId);
    }

    const friendIds = [...set].filter((item) => item !== id);

    const res: {
      id: number;
      username: string;
      nickname: string;
      email: string;
    }[] = [];

    for (let i = 0; i < friendIds.length; i++) {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: friendIds[i],
        },
        select: {
          id: true,
          username: true,
          nickname: true,
          email: true,
        },
      });
      res.push(user!);
    }

    return res;
  }
  async addFriend(userId: number, friendAddDto: FriendAddDto) {
    const { friendId } = friendAddDto;
    if (userId === +friendId) {
      throw new HttpException('不能添加自己为好友', HttpStatus.BAD_REQUEST);
    }
    const foundFriend = await this.prismaService.user.findUnique({
      where: {
        id: +friendId,
      },
    });
    if (!foundFriend) {
      throw new HttpException('添加的用户不存在', HttpStatus.BAD_REQUEST);
    }

    //检查是否已经是好友
    const isFriend = await this.prismaService.friendship.findFirst({
      where: {
        OR: [
          {
            userId,
            friendId: +friendId,
          }, //用户A与用户B之间
          {
            userId: +friendId,
            friendId: userId,
          },
        ],
      },
    });
    if (isFriend) {
      throw new HttpException('已经是好友', HttpStatus.BAD_REQUEST);
    }
    //检查是否已经发送过好友请求
    const isFriendRequest = await this.prismaService.friendRequest.findFirst({
      where: {
        AND: [
          {
            fromUserId: userId,
            toUserId: +friendId,
            status: 0,
          },
        ],
      },
    });
    if (isFriendRequest) {
      throw new HttpException('已经发送过好友请求', HttpStatus.BAD_REQUEST);
    }
    return await this.prismaService.friendRequest.create({
      data: {
        fromUserId: userId,
        toUserId: +friendId,
        reason: friendAddDto.reason ?? '请求加为好友',
        status: 0,
      },
    });
  }

  async getFriendRequest(userId: number) {
    return await this.prismaService.friendRequest.findMany({
      where: {
        OR: [
          {
            fromUserId: userId,
          },
          {
            toUserId: userId,
          },
        ],
      },
    });
  }

  async updateFriendRequest(
    userId: number,
    updateFriendRequestDto: FriendUpdateDto,
  ) {
    const { friendId, status } = updateFriendRequestDto;
    const statusMap = {
      1: '已同意',
      2: '已拒绝',
    };
    if (!(status in statusMap)) {
      throw new HttpException('状态错误', HttpStatus.BAD_REQUEST);
    }
    const foundFriendRequest = await this.prismaService.friendRequest.findFirst(
      {
        where: {
          AND: [
            {
              fromUserId: +friendId,
              toUserId: userId,
              status: 0,
            },
          ],
        },
      },
    );
    if (!foundFriendRequest) {
      throw new HttpException('好友请求不存在', HttpStatus.BAD_REQUEST);
    }

    await this.prismaService.friendRequest.updateMany({
      where: {
        fromUserId: +friendId,
        toUserId: userId,
        status: 0,
      },
      data: {
        status: +status,
      },
    });
    if (status == 1) {
      await this.prismaService.friendship.create({
        data: {
          userId: userId,
          friendId: +friendId,
        },
      });
    }

    return status == 1 ? '已同意好友请求' : '已拒绝好友请求';
  }

  async deleteFriend(friendId: number, userId: number) {
    if (!friendId) {
      throw new HttpException('friendId不能为空', HttpStatus.BAD_REQUEST);
    }
    return await this.prismaService.friendship.deleteMany({
      where: {
        userId,
        friendId: +friendId,
      },
    });
  }
}
