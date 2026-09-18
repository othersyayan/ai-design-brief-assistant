import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Updated title of the project',
    example: 'Terra Luxury SUV Interior v2',
  })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated design brief context',
    example: 'Updated with brushed aluminum trim options.',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
