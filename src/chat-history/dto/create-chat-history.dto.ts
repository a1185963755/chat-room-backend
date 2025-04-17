import { IsEmpty } from 'class-validator';

export class CreateChatHistoryDto {
  @IsEmpty({ message: 'content不能为空' })
  content: string;

  @IsEmpty({ message: 'type不能为空' })
  type: number;

  @IsEmpty({ message: 'chatroomId不能为空' })
  chatroomId: number;

  @IsEmpty({ message: 'userId不能为空' })
  senderId: number;
}
