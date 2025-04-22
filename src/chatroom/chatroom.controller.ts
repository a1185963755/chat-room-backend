import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { RequireLogin, UserInfo } from 'src/common/decorator/custom.decorator';

@RequireLogin()
@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Get('createOneToOneChatroom')
  async oneToOne(
    @Query('friendId') friendId: number,
    @UserInfo('id') userId: number,
  ) {
    if (!friendId) {
      throw new BadRequestException('聊天好友的 id 不能为空');
    }
    return this.chatroomService.createOneToOneChatroom(friendId, userId);
  }

  @Get('create-group')
  async group(@Query('name') name: string, @UserInfo('id') userId: number) {
    return this.chatroomService.createGroupChatroom(name, userId);
  }
  @Get('list')
  async getList(@UserInfo('id') userId: number) {
    return this.chatroomService.getChatroomList(userId);
  }
  @Get('members')
  async getDetail(@Query('chatroomId') chatroomId: number) {
    this.checkChatroomId(chatroomId);
    return this.chatroomService.getChatroomMembers(chatroomId);
  }

  @Get('info/:id')
  async info(@Param('id') id: number) {
    if (!id) {
      throw new BadRequestException('id不能为空');
    }
    return this.chatroomService.getChatroomInfo(id);
  }

  @Get('join/:id')
  async join(
    @Query('chatroomId') chatroomId: number,
    @Param('id') userId: number,
  ) {
    this.checkChatroomId(chatroomId);
    return this.chatroomService.joinChatroom(chatroomId, userId);
  }

  @Get('quit')
  async quit(
    @Query('chatroomId') chatroomId: number,
    @UserInfo('id') userId: number,
  ) {
    this.checkChatroomId(chatroomId);
    return this.chatroomService.quitChatroom(chatroomId, userId);
  }

  @Get('findOneToOneChatroom')
  async findOneToOneChatroom(
    @Query('userId1') userId1: string,
    @Query('userId2') userId2: string,
  ) {
    if (!userId1 || !userId2) {
      throw new BadRequestException('用户id不能为空');
    }
    if (userId1 === userId2) {
      throw new BadRequestException('用户id不能相同');
    }
    return this.chatroomService.findOneToOneChatroom(+userId1, +userId2);
  }

  private checkChatroomId(chatroomId: number) {
    if (!chatroomId) {
      throw new BadRequestException('聊天室id不能为空');
    }
  }
}
