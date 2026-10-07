import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FoldersService } from './folders.service';
import { Folders } from './folders.entity';
import { Cards } from './cards.entity';
import { Fields } from './fields.entity';
import { FieldsValues } from './fieldsValues.entity';
import { mockRepository, repositoryProvider, RepositoryMock } from '../../tests/testing-utils';

describe('FoldersService', () => {
  let service: FoldersService;
  let foldersRepo: RepositoryMock;

  beforeEach(async () => {
    foldersRepo = mockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoldersService,
        { provide: getRepositoryToken(Folders), useValue: foldersRepo },
        repositoryProvider(Cards),
        repositoryProvider(Fields),
        repositoryProvider(FieldsValues)
      ],
    }).compile();

    service = module.get<FoldersService>(FoldersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('rejects moving a folder into itself', async () => {
      foldersRepo.findOne.mockResolvedValueOnce({ id_folder: 7, belongs_to: null });

      await expect(service.update(7, { belong_id: 7 })).rejects.toThrow(BadRequestException);
      expect(foldersRepo.save).not.toHaveBeenCalled();
    });

    it('rejects moving a folder under one of its own descendants', async () => {
      // 7 -> 8 -> 9. Mover 7 adentro de 9 cerraria el ciclo.
      foldersRepo.findOne
        .mockResolvedValueOnce({ id_folder: 7, belongs_to: null })           // findById(7)
        .mockResolvedValueOnce({ id_folder: 8, belongs_to: { id_folder: 7 } }) // padre de 9
        .mockResolvedValueOnce({ id_folder: 9, belongs_to: { id_folder: 8 } }); // padre de 7

      await expect(service.update(7, { belong_id: 9 })).rejects.toThrow(
        /its own subtree/
      );
    });

    it('allows moving a folder under an unrelated parent', async () => {
      foldersRepo.findOne
        .mockResolvedValueOnce({ id_folder: 7, belongs_to: null })  // findById(7)
        .mockResolvedValueOnce({ id_folder: 3, belongs_to: null }); // padre de 4

      const saved = await service.update(7, { belong_id: 4 });

      expect(foldersRepo.save).toHaveBeenCalled();
      expect(saved.belongs_to).toEqual({ id_folder: 4 });
    });

    it('detects a cycle that already exists in the hierarchy', async () => {
      foldersRepo.findOne
        .mockResolvedValueOnce({ id_folder: 7, belongs_to: null })
        .mockResolvedValueOnce({ id_folder: 5, belongs_to: { id_folder: 6 } })
        .mockResolvedValueOnce({ id_folder: 6, belongs_to: { id_folder: 5 } });

      await expect(service.update(7, { belong_id: 5 })).rejects.toThrow(
        /already contains a cycle/
      );
    });
  });

  describe('create', () => {
    it('sets the company relation from the given id', async () => {
      const created = await service.create({ name: 'Docs', id_company: 3 });

      expect(foldersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ company: { id_company: 3 }, belongs_to: null })
      );
      expect(created).toBeDefined();
    });
  });
});
