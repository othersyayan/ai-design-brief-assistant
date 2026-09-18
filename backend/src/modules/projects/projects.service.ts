import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { NotFoundCustomException } from '../../common/exceptions/not-found.exception';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async create(userId: string, dto: CreateProjectDto) {
    this.logger.log(`Creating new project "${dto.title}" for user ${userId}`);
    return this.prisma.project.create({
      data: {
        userId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
      },
    });
  }

  public async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  public async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundCustomException(`Project with ID ${id} not found.`);
    }

    return project;
  }

  public async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.findOne(userId, id);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim(),
        }),
      },
    });
  }

  public async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.project.delete({
      where: { id },
    });

    this.logger.log(`Project ${id} deleted by user ${userId}`);
    return { message: 'Project deleted successfully' };
  }
}
