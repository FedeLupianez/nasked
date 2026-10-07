import { Test, TestingModule } from '@nestjs/testing';
import { AccountsCompaniesService } from './accounts-companies.service';
import { AccountsCompanies } from './accounts-companies.entity';
import { repositoryProvider } from '../../tests/testing-utils';

describe('AccountsCompaniesService', () => {
  let service: AccountsCompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsCompaniesService, repositoryProvider(AccountsCompanies)],
    }).compile();

    service = module.get<AccountsCompaniesService>(AccountsCompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
