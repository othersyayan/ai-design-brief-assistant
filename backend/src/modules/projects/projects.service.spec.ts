import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    project: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a project with trimmed input data', async () => {
      const userId = 'user-uuid-123';
      const dto = {
        title: '  Terra SUV Interior  ',
        description: ' Warm earth tones  ',
      };

      const expectedResult = {
        id: 'project-uuid-456',
        userId,
        title: 'Terra SUV Interior',
        description: 'Warm earth tones',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.create.mockResolvedValue(expectedResult);

      const result = await service.create(userId, dto);

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          userId,
          title: 'Terra SUV Interior',
          description: 'Warm earth tones',
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
