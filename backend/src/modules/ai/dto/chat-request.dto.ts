import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    description: 'User message or prompt for the AI design brief assistant',
    example:
      'What exterior trim options pair best with matte liquid silver paint?',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}
