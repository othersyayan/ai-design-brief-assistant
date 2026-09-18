import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService, ProjectContext } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('mock-gemini-api-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  describe('buildSystemPrompt', () => {
    it('should inject project title and description into the system prompt context', () => {
      const projectContext: ProjectContext = {
        title: 'CyberGT Concept',
        description: 'Satin silver paint with carbon fibre trim.',
      };

      const prompt = (service as any).buildSystemPrompt(projectContext);

      expect(prompt).toContain('CyberGT Concept');
      expect(prompt).toContain('Satin silver paint with carbon fibre trim.');
      expect(prompt).toContain('Automotive Design Brief Assistant');
    });
  });
});
