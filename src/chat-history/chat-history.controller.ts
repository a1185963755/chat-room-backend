import { Controller, Get, Post, Query } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { RequireLogin } from 'src/common/decorator/custom.decorator';
import { CreateChatHistoryDto } from './dto/create-chat-history.dto';

@RequireLogin()
@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @Get('list')
  async getChatHistory(@Query('chatroomId') chatroomId: number) {
    return this.chatHistoryService.getChatHistory(chatroomId);
  }

  @Post('add')
  async clearChatHistory(createChatHistoryDto: CreateChatHistoryDto) {
    return this.chatHistoryService.createChatHistory(createChatHistoryDto);
  }
}
