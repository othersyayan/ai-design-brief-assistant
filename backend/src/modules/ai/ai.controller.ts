import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Sse,
  Logger,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Role } from 'generated/prisma/enums';
import { AiService } from './ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { NotFoundCustomException } from '../../common/exceptions/not-found.exception';

@ApiTags('projects-ai')
@Controller('api/v1/projects')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Streams AI chat responses using Server-Sent Events (SSE).
   *
   * @param projectId ID of the project
   * @param dto Chat request containing user prompt
   */
  @Sse(':projectId/chat')
  @ApiOperation({ summary: 'Stream AI design advice via SSE' })
  public async chatStream(
    @Param('projectId') projectId: string,
    @Body() dto: ChatRequestDto,
  ): Promise<Observable<MessageEvent>> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20, // Sliding window: last 20 messages for context
        },
      },
    });

    if (!project) {
      throw new NotFoundCustomException(
        `Project with ID ${projectId} not found.`,
      );
    }

    // 1. Save incoming user message to Database
    await this.prisma.message.create({
      data: {
        projectId,
        role: Role.USER,
        content: dto.message,
      },
    });

    // 2. Prepare history for AI service
    const history = project.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Obtain AsyncGenerator stream from AiService
    const generator = this.aiService.streamChatResponse(
      { title: project.title, description: project.description },
      history,
      dto.message,
    );

    // 4. Convert AsyncGenerator into RxJS Observable for NestJS Fastify SSE
    return new Observable<MessageEvent>((observer) => {
      let accumulatedResponse = '';

      (async () => {
        try {
          for await (const token of generator) {
            accumulatedResponse += token;
            observer.next({ data: { chunk: token } });
          }

          // Save complete ASSISTANT message to DB once stream finishes
          if (accumulatedResponse.trim().length > 0) {
            await this.prisma.message.create({
              data: {
                projectId,
                role: Role.ASSISTANT,
                content: accumulatedResponse,
              },
            });
          }

          observer.next({ data: { done: true } });
          observer.complete();
        } catch (err: any) {
          this.logger.error(`SSE Stream error: ${err.message}`);
          observer.error(err);
        }
      })();
    });
  }

  /**
   * Summarizes key design decisions made during the project conversation.
   */
  @Post(':projectId/summarize')
  @ApiOperation({ summary: 'Summarize key CMF design decisions' })
  public async summarizeDecisions(@Param('projectId') projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundCustomException(
        `Project with ID ${projectId} not found.`,
      );
    }

    const history = project.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const summary = await this.aiService.summarizeDecisions(
      { title: project.title, description: project.description },
      history,
    );

    return { summary };
  }

  /**
   * Resets the conversation messages for a project without deleting the project.
   */
  @Delete(':projectId/messages')
  @ApiOperation({ summary: 'Reset conversation history for a project' })
  public async resetConversation(@Param('projectId') projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundCustomException(
        `Project with ID ${projectId} not found.`,
      );
    }

    await this.prisma.message.deleteMany({
      where: { projectId },
    });

    return { message: 'Conversation history successfully reset.' };
  }
}
