import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OllamaProvider } from './ollama.service';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    {
      provide: 'AIProvider',
      useClass: OllamaProvider,
    },
  ],
  exports: [AIService],
})
export class AIModule {}
