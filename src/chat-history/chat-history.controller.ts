import { Controller, Get, Post } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { RequireLogin } from 'src/common/decorator/custom.decorator';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';

@RequireLogin()
@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Get('list')
  async getChatHistory(chatroomId: number) {
    return this.chatHistoryService.getChatHistory(chatroomId);
  }

  @Post('add')
  async clearChatHistory(createChatHistoryDto: CreateChatHistoryDto) {
    return this.chatHistoryService.createChatHistory(createChatHistoryDto);
  }
}
