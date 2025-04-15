import { Body, Controller, Get, Post } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendAddDto } from './dto/friend-add.dto';
import { RequireLogin, UserInfo } from 'src/common/decorator/custom.decorator';
import { FriendUpdateDto } from './dto/friend-update.dto';

@RequireLogin()
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Get('list')
  getFriendship(@UserInfo('id') id: number) {
    return this.friendshipService.getFriendship(+id);
  }

  @Post('add')
  addFriend(@Body() friendAddDto: FriendAddDto, @UserInfo('id') id: number) {
    return this.friendshipService.addFriend(+id, friendAddDto);
  }

  @Get('request_list')
  requestList(@UserInfo('id') id: number) {
    return this.friendshipService.getFriendRequest(+id);
  }

  @Post('update')
  updateFriendship(
    @Body() friendAddDto: FriendUpdateDto,
    @UserInfo('id') id: number,
  ) {
    return this.friendshipService.updateFriendRequest(+id, friendAddDto);
  }

  @Post('delete')
  deleteFriendship(@Body('id') friendId: number, @UserInfo('id') id: number) {
    return this.friendshipService.deleteFriend(friendId, id);
  }
}
