import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Folders } from './folders.entity';
import { CreateFolderDTO, UpdateFolderDTO } from './dto/elements.dto';
import { ListQuery } from '../common/dto/list-query.dto';
import { Companies } from '../companies/companies.entity';
import { Cards } from './cards.entity';
import { Fields } from './fields.entity';
import { FieldsValues } from './fieldsValues.entity';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folders)
    private readonly foldersRepo: Repository<Folders>,
    @InjectRepository(Cards)
    private readonly cardsRepo: Repository<Cards>,
    @InjectRepository(Fields)
    private readonly fieldsRepo: Repository<Fields>,
    @InjectRepository(FieldsValues)
    private readonly fieldsValuesRepo: Repository<FieldsValues>
  ) { }

  async create(dto: CreateFolderDTO): Promise<Folders> {
    const folder = this.foldersRepo.create({
      name: dto.name,
      token: dto.token,
      // `id_company` y `belong_id` son FKs implicitas (JoinColumn).
      company: { id_company: dto.id_company } as Companies,
      belongs_to: dto.belong_id ? ({ id_folder: dto.belong_id } as Folders) : null
    });
    return await this.foldersRepo.save(folder);
  }

  async findAll(query: ListQuery & { id_company?: number; belong_id?: number } = {}): Promise<Folders[]> {
    const where: Record<string, unknown> = {};
    if (query.id_company) where.company = { id_company: query.id_company };
    if (query.belong_id) where.belongs_to = { id_folder: query.belong_id };

    return await this.foldersRepo.find({
      where,
      relations: { company: true, children: true },
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_folder: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  /** Carpetas raiz de una empresa (sin carpeta padre). */
  async findRoots(id_company: number): Promise<Folders[]> {
    if (!id_company) throw new BadRequestException('id_company is required');
    return await this.foldersRepo.find({
      where: { company: { id_company }, belongs_to: null },
      relations: { children: true },
      order: { id_folder: 'ASC' }
    });
  }

  async findById(id_folder: number): Promise<Folders> {
    const folder = await this.foldersRepo.findOne({
      where: { id_folder },
      relations: { company: true, belongs_to: true, children: true, cards: true }
    });
    if (!folder) throw new NotFoundException('Folder not found');
    return folder;
  }

  async findByName(name: string, id_company: number): Promise<Folders[]> {
    return await this.foldersRepo.find({
      where: { name: Like(`%${name}%`), company: { id_company } }
    });
  }

  async update(id_folder: number, changes: UpdateFolderDTO): Promise<Folders> {
    const folder = await this.findById(id_folder);
    if (changes.name !== undefined) folder.name = changes.name;
    if (changes.token !== undefined) folder.token = changes.token;
    if (changes.belong_id !== undefined) {
      if (changes.belong_id === id_folder)
        throw new BadRequestException('A folder cannot be its own parent');
      // Mueve la carpeta y toda su descendencia bajo el nuevo padre.
      await this.assertNoCycle(id_folder, changes.belong_id);
      folder.belongs_to = changes.belong_id ? ({ id_folder: changes.belong_id } as Folders) : null;
    }
    return await this.foldersRepo.save(folder);
  }

  /**
   * Borra la carpeta con todo su subarbol. Las FKs hacia abajo son NOT NULL,
   * asi que el borrado va de hojas a raiz: valores -> campos -> tarjetas -> carpetas.
   */
  async remove(id_folder: number): Promise<boolean> {
    await this.findById(id_folder);
    await this.cascadeRemove(id_folder);
    const result = await this.foldersRepo.delete({ id_folder });
    if (!result.affected) throw new NotFoundException('Folder not found');
    return true;
  }

  private async cascadeRemove(id_folder: number): Promise<void> {
    const children = await this.foldersRepo.find({ where: { belongs_to: { id_folder } } });
    for (const child of children)
      await this.cascadeRemove(child.id_folder);

    const cards = await this.cardsRepo.find({ where: { folder: { id_folder } } });
    for (const card of cards) {
      const fields = await this.fieldsRepo.find({ where: { card: { id_card: card.id_card } } });
      for (const field of fields)
        await this.fieldsValuesRepo.delete({ field: { id_field: field.id_field } });
      if (fields.length)
        await this.fieldsRepo.delete({ card: { id_card: card.id_card } });
    }
    if (cards.length)
      await this.cardsRepo.delete({ folder: { id_folder } });

    if (children.length)
      await this.foldersRepo.delete({ belongs_to: { id_folder } });
  }

  /** Falla si `target` es la carpeta misma o una de sus descendientes. */
  private async assertNoCycle(id_folder: number, target: number): Promise<void> {
    const seen = new Set<number>();
    let cursor: number | undefined = target;

    while (cursor !== undefined) {
      if (cursor === id_folder)
        throw new BadRequestException('Cannot move a folder inside its own subtree');
      if (seen.has(cursor))
        throw new BadRequestException('Folder hierarchy already contains a cycle');
      seen.add(cursor);

      const parent: Pick<Folders, 'id_folder'> & { belongs_to?: Folders } | null =
        await this.foldersRepo.findOne({
          where: { id_folder: cursor },
          relations: { belongs_to: true }
        });
      cursor = parent?.belongs_to?.id_folder;
    }
  }
}
