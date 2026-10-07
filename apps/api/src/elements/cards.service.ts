import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Like, Repository } from 'typeorm';
import { Cards } from './cards.entity';
import { CreateCardDTO, UpdateCardDTO } from './dto/elements.dto';
import { ListQuery } from '../common/dto/list-query.dto';
import { Folders } from './folders.entity';
import { Fields } from './fields.entity';
import { FieldsValues } from './fieldsValues.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Cards)
    private readonly cardsRepo: Repository<Cards>,
    @InjectRepository(Fields)
    private readonly fieldsRepo: Repository<Fields>,
    @InjectRepository(FieldsValues)
    private readonly fieldsValuesRepo: Repository<FieldsValues>
  ) { }

  async create(dto: CreateCardDTO): Promise<Cards> {
    const card = this.cardsRepo.create({
      title: dto.title,
      description: dto.description,
      // `id_folder` es una FK implicita (JoinColumn).
      folder: { id_folder: dto.id_folder } as Folders,
      deadline: dto.deadline ? new Date(dto.deadline) : null,
      active: dto.active ?? true
    });
    return await this.cardsRepo.save(card);
  }

  async findAll(query: ListQuery & {
    id_folder?: number;
    active?: boolean;
    search?: string;
    deadline_before?: string;
  } = {}): Promise<Cards[]> {
    const where: Record<string, unknown> = {};
    if (query.id_folder) where.folder = { id_folder: query.id_folder };
    if (typeof query.active === 'boolean') where.active = query.active;
    if (query.search) where.title = Like(`%${query.search}%`);
    if (query.deadline_before) where.deadline = LessThanOrEqual(new Date(query.deadline_before));

    return await this.cardsRepo.find({
      where,
      relations: { folder: true, fields: true },
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_card: 'DESC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_card: number): Promise<Cards> {
    const card = await this.cardsRepo.findOne({
      where: { id_card },
      relations: { folder: true, fields: true }
    });
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  /** Tarjetas de una carpeta, con sus campos y el valor de cada uno. */
  async findByFolder(id_folder: number): Promise<Cards[]> {
    if (!id_folder) throw new BadRequestException('id_folder is required');
    return await this.cardsRepo.find({
      where: { folder: { id_folder } },
      relations: { fields: { values: true } },
      order: { id_card: 'DESC' }
    });
  }

  async update(id_card: number, changes: UpdateCardDTO): Promise<Cards> {
    const card = await this.findById(id_card);
    if (changes.title !== undefined) card.title = changes.title;
    if (changes.description !== undefined) card.description = changes.description;
    if (changes.active !== undefined) card.active = changes.active;
    if (changes.deadline !== undefined)
      card.deadline = changes.deadline ? new Date(changes.deadline) : null;
    if (changes.id_folder !== undefined) {
      if (changes.id_folder === id_card)
        throw new BadRequestException('A card cannot belong to itself');
      card.folder = { id_folder: changes.id_folder } as Folders;
    }
    return await this.cardsRepo.save(card);
  }

  /** Baja logica: las tarjetas se desactivan en vez de borrarse. */
  async remove(id_card: number): Promise<Cards> {
    const card = await this.findById(id_card);
    if (!card.active) throw new BadRequestException('Card is already inactive');
    card.active = false;
    return await this.cardsRepo.save(card);
  }

  /** Borrado fisico en cascada: valores -> campos -> tarjeta. */
  async hardRemove(id_card: number): Promise<boolean> {
    await this.findById(id_card);
    const fields = await this.fieldsRepo.find({ where: { card: { id_card } } });
    for (const field of fields)
      await this.fieldsValuesRepo.delete({ field: { id_field: field.id_field } });
    if (fields.length)
      await this.fieldsRepo.delete({ card: { id_card } });

    const result = await this.cardsRepo.delete({ id_card });
    if (!result.affected) throw new NotFoundException('Card not found');
    return true;
  }
}
