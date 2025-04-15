import { IsNotEmpty } from 'class-validator';

export class FriendUpdateDto {
  @IsNotEmpty({
    message: '好友ID不能为空',
  })
  friendId: number;

  @IsNotEmpty({
    message: '状态不能为空',
  })
  status: number;
}
