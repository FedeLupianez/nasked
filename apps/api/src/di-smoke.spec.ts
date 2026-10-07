import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from './app/app.module';

/**
 * Smoke test del grafo de DI: confirma que todos los providers (y por lo tanto
 * todos los repositorios que inyectan los services) resuelven. No toca la base.
 */
describe('DI graph', () => {
  beforeAll(() => {
    // TypeOrmCoreModule hace `dataSource.initialize()` y usa el valor devuelto
    // como provider, asi que el stub tiene que devolver la propia instancia.
    vi.spyOn(DataSource.prototype, 'initialize').mockImplementation(function (this: any) {
      this.isInitialized = true;
      return Promise.resolve(this);
    });
    vi.spyOn(DataSource.prototype, 'destroy').mockResolvedValue(undefined as any);
    vi.spyOn(DataSource.prototype, 'getRepository').mockImplementation(function (this: any, entity: any): any {
      return { manager: this, metadata: { tableName: String(entity) } };
    });
    vi.spyOn(DataSource.prototype, 'createQueryRunner').mockReturnValue({} as any);
  });

  it('compiles AppModule', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    await moduleRef.init();
    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
