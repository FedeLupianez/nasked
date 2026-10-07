import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  role: string;
}

export class UpdateRoleDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  role?: string;
}

export class CreatePermissionDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  permission: string;
}

export class UpdatePermissionDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  permission?: string;
}

/** Asigna permisos a un rol (relacion N:M sobre Roles_Permissions). */
export class SetRolePermissionsDTO {
  @IsNotEmpty()
  @IsInt()
  id_permission: number;
}
