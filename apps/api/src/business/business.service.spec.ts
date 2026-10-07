import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from './business.service';
import { PlansService } from './plans.service';
import { BillsService } from './bills.service';
import { PaymentsService } from './payments.service';
import { Plans } from './plans.entity';
import { Bills } from './bills.entity';
import { Payments } from './payments.entity';
import { repositoryProvider } from '../../tests/testing-utils';

describe('BusinessService', () => {
  let service: BusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        PlansService,
        BillsService,
        PaymentsService,
        repositoryProvider(Plans),
        repositoryProvider(Bills),
        repositoryProvider(Payments)
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
