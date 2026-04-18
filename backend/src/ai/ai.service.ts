import { Injectable, Inject } from '@nestjs/common';
import type { AIProvider } from './types/ai-provider.interface'

@Injectable()
export class AIService {
  constructor(@Inject('AIProvider') private provider: AIProvider) {}

  async ask(question: string) {
    return this.provider.generateResponse(question);
  }
}