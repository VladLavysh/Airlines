import { Injectable } from '@nestjs/common';
import { Ollama } from 'ollama'
import type { AIProvider } from './types/ai-provider.interface'
import { systemPromptGemma2 } from './common/prompts'
import { ResponseDTO } from './dto/answer.dto';
import { ResponseType } from './common/prompts';
import { FlightService } from 'src/flight/flight.service';

@Injectable()
export class OllamaProvider implements AIProvider {
  private readonly ollama: Ollama;
  private flightService: FlightService

  constructor(flightService: FlightService) {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_API_URL || 'http://localhost:11434'
    });
    this.flightService = flightService;
  }

  async generateResponse(prompt: string): Promise<ResponseDTO> {
    try {
      const response = await this.ollama.chat({
        model: process.env.OLLAMA_MODEL || 'gemma2:2b',
        messages: [
          { role: 'system', content: systemPromptGemma2 },
          { role: 'user', content: prompt }
        ],
        format: 'json'
      })

      const content = response.message.content.replace(/```json\n|\n```/g, '').trim();

      if (!content) {
        throw new Error('Empty response from Ollama');
      }

      const parsedContent: ResponseDTO = JSON.parse(content);

      if (parsedContent.type === ResponseType.SEARCH) {
        const searchParams = {
          ...parsedContent.params,
          departure_time: parsedContent.params?.dateFrom
            ? new Date(parsedContent.params.dateFrom)
            : undefined,
          order_by: 'departure_time' as const,
          order: 'asc' as const,
        };

        const flights = await this.flightService.getAllFlights(searchParams);

        const responseMessage = flights.length
          ? `Done! ${flights.length} flight${flights.length > 1 ? 's' : ''} found. Check the flights list. \n\nWant me to book a flight for you?`
          : "No flights found. Try searching for a different route."

        return {
          ...parsedContent,
          message: responseMessage,
          data: flights,
        };
      }

      return parsedContent;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  }
}