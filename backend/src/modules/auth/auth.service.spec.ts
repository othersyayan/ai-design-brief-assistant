import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UnauthorizedCustomException } from '../../common/exceptions/unauthorized.exception';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should authenticate user and return access token on valid credentials', async () => {
      const loginDto = { email: 'test@lmesh.eu', password: 'password' };
      const mockUser = {
        id: 'user-uuid-1',
        email: 'test@lmesh.eu',
        password: 'hashed-password',
        name: 'Senior Lead Designer',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@lmesh.eu' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        'hashed-password',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        accessToken: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      });
    });

    it('should throw UnauthorizedCustomException when password is invalid', async () => {
      const loginDto = { email: 'test@lmesh.eu', password: 'wrongpassword' };
      const mockUser = {
        id: 'user-uuid-1',
        email: 'test@lmesh.eu',
        password: 'hashed-password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedCustomException,
      );
    });
  });
});
