import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new design project' })
  public async create(
    @GetUser('id') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all design projects for authenticated user' })
  public async findAll(@GetUser('id') userId: string) {
    return this.projectsService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details with chat history' })
  public async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.projectsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project title or description' })
  public async update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a design project' })
  public async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.projectsService.remove(userId, id);
  }
}
