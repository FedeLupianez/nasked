import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { AccessService } from './access.service';
import { Roles } from './roles.entity';
import { Permissions } from './permissions.entity';
import { AccountsService } from '../accounts/accounts.service';
import { repositoryProvider } from '../../tests/testing-utils';

describe('AccessService', () => {
  let service: AccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessService,
        RolesService,
        PermissionsService,
        repositoryProvider(Roles),
        repositoryProvider(Permissions),
        { provide: AccountsService, useValue: { companiesOf: vi.fn(async () => []) } }
      ],
    }).compile();

    service = module.get<AccessService>(AccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('RolesService', () => {
  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService, repositoryProvider(Roles)]
    }).compile();
    expect(module.get<RolesService>(RolesService)).toBeDefined();
  });
});

describe('PermissionsService', () => {
  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionsService, repositoryProvider(Permissions)]
    }).compile();
    expect(module.get<PermissionsService>(PermissionsService)).toBeDefined();
  });
});
