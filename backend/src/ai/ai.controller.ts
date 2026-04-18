import { Controller, Post, Body } from '@nestjs/common';
import { AIService } from './ai.service';
import { AskDto } from './dto/ask.dto';

@Controller('ai')
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('ask')
  async ask(@Body() askDto: AskDto) {
    return this.aiService.ask(askDto.question);
  }
}