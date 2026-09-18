import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BadRequestCustomException } from '../../common/exceptions/bad-request.exception';

export interface ProjectContext {
  title: string;
  description?: string | null;
}

export interface ChatHistoryItem {
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn(
        'GEMINI_API_KEY is not set. AI features will fallback or throw errors.',
      );
    }
  }

  /**
   * Generates a streaming response from Gemini model using AsyncGenerator.
   *
   * @param project Context details of the automotive design project
   * @param history Prior conversation history for context awareness
   * @param newMessage The new user prompt
   * @returns AsyncGenerator emitting string chunks progressively
   */
  public async *streamChatResponse(
    project: ProjectContext,
    history: ChatHistoryItem[],
    newMessage: string,
  ): AsyncGenerator<string, void, unknown> {
    if (!this.genAI) {
      throw new BadRequestCustomException(
        'AI Provider is not configured properly.',
      );
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3.5-flash-lite',
      });

      // Construct System Prompt incorporating project design context
      const systemPrompt = this.buildSystemPrompt(project);

      // Convert database messages to Gemini SDK contents format
      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        {
          role: 'model',
          parts: [
            {
              text: 'Understood. I am ready to assist with your CMF and automotive design decisions.',
            },
          ],
        },
        ...history.map((msg) => ({
          role: msg.role === 'ASSISTANT' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        { role: 'user', parts: [{ text: newMessage }] },
      ];

      const result = await model.generateContentStream({ contents });

      for await (const chunk of result.stream) {
        const textChunk = chunk.text();
        if (textChunk) {
          yield textChunk;
        }
      }
    } catch (error: any) {
      this.logger.error(
        `Error during AI streaming: ${error.message}`,
        error.stack,
      );
      throw new BadRequestCustomException(
        `AI provider streaming failed: ${error.message}`,
      );
    }
  }

  /**
   * Generates a structured summary of key CMF and design decisions made in the chat.
   *
   * @param project Context details of the project
   * @param history Full chat history
   * @returns Formatted summary string
   */
  public async summarizeDecisions(
    project: ProjectContext,
    history: ChatHistoryItem[],
  ): Promise<string> {
    if (!this.genAI) {
      throw new BadRequestCustomException(
        'AI Provider is not configured properly.',
      );
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3.5-flash-lite',
      });

      const conversationText = history
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      const prompt = `
You are an expert Automotive CMF (Colour, Material, Finish) Design Lead.
Project Title: ${project.title}
Project Brief: ${project.description || 'N/A'}

Review the conversation history below and summarize key design decisions made so far in bullet points:
- Material Choices (Leather, Fabrics, Composites)
- Colour Palette & Finishes
- Design Direction & Theme Highlights

Conversation History:
${conversationText}
`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return result.response.text();
    } catch (error: any) {
      this.logger.error(
        `Error during AI summarization: ${error.message}`,
        error.stack,
      );
      throw new BadRequestCustomException('Failed to generate design summary.');
    }
  }

  /**
   * Helper to construct system prompt with project metadata context.
   */
  private buildSystemPrompt(project: ProjectContext): string {
    return `You are an AI Automotive Design Brief Assistant for lmesh.
You are helping a senior designer work on the project: "${project.title}".
Project Design Context: "${project.description || 'General automotive design brief'}".

Your goal:
1. Provide expert guidance on CMF (Colour, Material, Finish), exterior styling, interior ergonomics, and sustainability.
2. Keep responses concise, practical, and highly relevant to the project's design context.
`;
  }
}
