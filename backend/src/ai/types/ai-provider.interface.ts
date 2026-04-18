import { ResponseDTO } from "src/ai/dto/answer.dto";

export interface AIProvider {
  generateResponse(prompt: string): Promise<ResponseDTO>
}
