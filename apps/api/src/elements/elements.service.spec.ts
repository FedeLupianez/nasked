import { Test, TestingModule } from '@nestjs/testing';
import { ElementsService } from './elements.service';
import { FoldersService } from './folders.service';
import { CardsService } from './cards.service';
import { FieldsService } from './fields.service';
import { FieldsValuesService } from './fields-values.service';
import { Folders } from './folders.entity';
import { Cards } from './cards.entity';
import { Fields } from './fields.entity';
import { FieldsValues } from './fieldsValues.entity';
import { repositoryProvider } from '../../tests/testing-utils';

describe('ElementsService', () => {
  let service: ElementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElementsService,
        FoldersService,
        CardsService,
        FieldsService,
        FieldsValuesService,
        repositoryProvider(Folders),
        repositoryProvider(Cards),
        repositoryProvider(Fields),
        repositoryProvider(FieldsValues)
      ],
    }).compile();

    service = module.get<ElementsService>(ElementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
