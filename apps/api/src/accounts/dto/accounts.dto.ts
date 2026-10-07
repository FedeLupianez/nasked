import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateAccountDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  profile_image?: string;
}

export class UpdateAccountDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  profile_image?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

/** Alta de la relacion cuenta <-> empresa <-> rol. */
export class CreateAccountsCompaniesDTO {
  @IsNotEmpty()
  @IsString()
  id_account: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  id_company: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  id_role: number;
}

export class UpdateAccountsCompaniesDTO {
  @IsOptional()
  @IsInt()
  @Min(1)
  id_role?: number;
}
