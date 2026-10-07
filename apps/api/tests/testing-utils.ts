import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

/**
 * Repository falsa con vi.fn() en los metodos que usan los services, para poder
 * afirmar sobre las llamadas sin levantar MariaDB.
 *
 * Se devuelve sin castear a `Repository<T>` a proposito: los tests necesitan
 * `.mockResolvedValueOnce(...)`, que vive en el tipo de `vi.fn`.
 */
export function mockRepository(overrides: Record<string, unknown> = {}) {
  return {
    create: vi.fn((entity: unknown): any => entity),
    save: vi.fn(async (entity: unknown): Promise<any> => entity),
    find: vi.fn(async (): Promise<any[]> => []),
    findOne: vi.fn(async (): Promise<any> => null),
    findOneBy: vi.fn(async (): Promise<any> => null),
    exists: vi.fn(async (): Promise<boolean> => false),
    count: vi.fn(async (): Promise<number> => 0),
    delete: vi.fn(async (): Promise<{ affected: number }> => ({ affected: 1 })),
    remove: vi.fn(async (entity: unknown): Promise<any> => entity),
    update: vi.fn(async (): Promise<{ affected: number }> => ({ affected: 1 })),
    query: vi.fn(async (): Promise<any[]> => []),
    ...overrides
  };
}

export type RepositoryMock = ReturnType<typeof mockRepository>;

/** Provider de Nest que resuelve `getRepositoryToken(Entity)` con el mock. */
export function repositoryProvider(
  entity: new (...args: never[]) => ObjectLiteral,
  overrides: Record<string, unknown> = {}
): Provider {
  return {
    provide: getRepositoryToken(entity),
    useValue: mockRepository(overrides) as unknown as Repository<ObjectLiteral>
  };
}
