import { BadRequestException } from '@nestjs/common';
import { parse, stringify, validate, v7 as uuidv7 } from 'uuid';

/**
 * Las claves primarias de las identidades (Accounts) son UUIDv7 guardados en
 * columnas `binary(16)`. TypeORM no sabe convertirlos solo, asi que los servicios
 * deben usar estos helpers en vez de `Buffer.from(parse(id))` a mano.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Genera un UUIDv7 nuevo y devuelve sus 16 bytes listos para `binary(16)`.
 * El parametro `Buffer<ArrayBuffer>` (y no `Buffer` a secas) es lo que espera
 * TypeORM para las columnas binarias; sin el no compilan los `In([...])`.
 */
export function newUuidBuffer(): Buffer<ArrayBuffer> {
  return Buffer.from(parse(uuidv7()));
}

/**
 * Convierte un UUID (string) a los 16 bytes que espera la columna.
 * Lanza BadRequestException si no es un UUID valido, para no dejar que un
 * id malformado llegue a la base y reviente con un error de driver.
 */
export function toUuidBuffer(id: string): Buffer<ArrayBuffer> {
  if (typeof id !== 'string' || !UUID_PATTERN.test(id)) {
    throw new BadRequestException(`Invalid uuid: ${id}`);
  }
  return Buffer.from(parse(id));
}

/**
 * Convierte lo que devuelve TypeORM para una columna `binary(16)` a un UUID string.
 * Acepta string tal cual para no romper callers que ya.tenian el id en texto.
 */
export function toUuidString(id: Buffer | string): string {
  if (typeof id === 'string') return id;
  if (!Buffer.isBuffer(id) || id.length !== 16) {
    throw new BadRequestException('Expected a 16 byte binary uuid');
  }
  return stringify(id);
}

/** `true` si el valor parece un UUID utilizable como id de identidad. */
export function isUuid(id: unknown): id is string {
  return typeof id === 'string' && validate(id);
}
