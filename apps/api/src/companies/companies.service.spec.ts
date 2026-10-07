import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { CategoriesService } from './categories.service';
import { Companies } from './companies.entity';
import { Categories } from './categories.entity';
import { repositoryProvider } from '../../tests/testing-utils';

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        CategoriesService,
        repositoryProvider(Companies),
        repositoryProvider(Categories)
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('CategoriesService', () => {
  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, repositoryProvider(Categories)]
    }).compile();
    expect(module.get<CategoriesService>(CategoriesService)).toBeDefined();
  });
});
