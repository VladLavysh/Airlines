import { Injectable } from '@nestjs/common';
import type { AIProvider } from './types/ai-provider.interface'
import axios from 'axios'

@Injectable()
export class OllamaProvider implements AIProvider {
  private baseUrl = process.env.OLLAMA_API_URL

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: 'gemma2:2b',
        prompt: prompt,
        stream: false
      })
      return (response.data as { response: string }).response
    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  }
}