import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Title of the design project',
    example: 'Terra Luxury SUV Interior',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional({
    description: 'Design brief context, CMF specs, or project goals',
    example: 'Warm earth tones, matte leather, open-pore walnut wood.',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
