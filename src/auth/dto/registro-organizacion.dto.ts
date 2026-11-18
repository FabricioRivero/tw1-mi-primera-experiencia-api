import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegistroOrganizacionDto {
  @ApiProperty({ example: 'talento@empresa.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({
    example: 'UnaClave-segura-123',
    minLength: 12,
    maxLength: 72,
    writeOnly: true,
  })
  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;

  @ApiProperty({
    example: 'Empresa Ejemplo S.R.L.',
    minLength: 2,
    maxLength: 160,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  nombre!: string;
}
