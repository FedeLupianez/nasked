import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { RegisterDTO } from '../../auth/dto/register.dto';
import { CompanyStatus } from '../companies.entity';

export class CreateCompany {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  logo?: string;

  /** Nombres de categoria a vincular. Se resuelven a ids contra Nasked_Categories. */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsNotEmpty()
  @IsInt()
  id_plan: number;
}

export class registerCompanyDTO {
  company: CreateCompany;
  user: RegisterDTO;
}

export class UpdateCompanyDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  logo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsInt()
  id_plan?: number;

  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;
}

export class CreateCategoryDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  category: string;
}

export class UpdateCategoryDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  category?: string;
}

/** Vincula/desvincula una empresa de una categoria (N:M sobre Companies_Categories). */
export class CompanyCategoryDTO {
  @IsNotEmpty()
  @IsInt()
  id_category: number;
}
