import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Los refresh tokens normalmente los crea `AuthService` a partir del JWT, no un
 * controller. Este DTO existe para el alta manual (seed / testing).
 */
export class CreateRefreshTokenDTO {
  /** Token ya hasheado con sha256, en hex. `AuthService.hashToken` produce el Buffer. */
  @IsNotEmpty()
  @IsString()
  tokenHashed: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsDateString()
  limit_date?: string;
}

export class UpdateRefreshTokenDTO {
  @IsOptional()
  @IsDateString()
  limit_date?: string;
}
