import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'estudiante@ejemplo.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    example: 'UnaClave-larga-123',
    minLength: 12,
    maxLength: 72,
    writeOnly: true,
  })
  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;
}
