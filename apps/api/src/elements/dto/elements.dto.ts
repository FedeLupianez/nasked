import {
  IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional,
  IsString, MaxLength,
} from 'class-validator';
import { FieldType } from '../fields.entity';

/* ---------------------------------------------------------------- Folders */

export class CreateFolderDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsInt()
  id_company: number;

  @IsOptional()
  @IsString()
  @MaxLength(6)
  token?: string;

  /** Carpeta padre. Omitirla crea una carpeta raiz. */
  @IsOptional()
  @IsInt()
  belong_id?: number;
}

export class UpdateFolderDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(6)
  token?: string;

  @IsOptional()
  @IsInt()
  belong_id?: number;
}

/* ------------------------------------------------------------------ Cards */

export class CreateCardDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  description: string;

  @IsNotEmpty()
  @IsInt()
  id_folder: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateCardDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsInt()
  id_folder?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

/* ----------------------------------------------------------------- Fields */

export class CreateFieldDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsInt()
  id_card: number;

  @IsOptional()
  @IsEnum(FieldType)
  type?: FieldType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  /** JSON serializado con las opciones del campo. */
  @IsOptional()
  @IsString()
  options?: string;
}

export class UpdateFieldDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(FieldType)
  type?: FieldType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  options?: string;
}

/* ------------------------------------------------------------ FieldsValues */

export class CreateFieldValueDTO {
  @IsNotEmpty()
  @IsInt()
  id_field: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  value: string;
}

export class UpdateFieldValueDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  value?: string;
}

/** Carga multiple de valores para un mismo campo. */
export class CreateFieldValuesDTO {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  values: string[];
}
