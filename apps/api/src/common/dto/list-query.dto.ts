import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Paginacion y orden para los `findAll` de los services. Se mantiene
 * deliberadamente chica (skip/limit) para no inventar un cursor que la base
 * todavia no soporta.
 */
export class ListQuery {
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;

  /** Columna por la cual ordenar. */
  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}
