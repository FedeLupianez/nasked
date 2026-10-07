import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fields, FieldType } from './fields.entity';
import { CreateFieldDTO, UpdateFieldDTO } from './dto/elements.dto';
import { ListQuery } from '../common/dto/list-query.dto';
import { Cards } from './cards.entity';
import { FieldsValues } from './fieldsValues.entity';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Fields)
    private readonly fieldsRepo: Repository<Fields>,
    @InjectRepository(FieldsValues)
    private readonly fieldsValuesRepo: Repository<FieldsValues>
  ) { }

  async create(dto: CreateFieldDTO): Promise<Fields> {
    const field = this.fieldsRepo.create({
      name: dto.name,
      type: dto.type ?? FieldType.TEXT,
      required: dto.required ?? false,
      options: dto.options,
      // `id_card` es una FK implicita (JoinColumn).
      card: { id_card: dto.id_card } as Cards
    });
    return await this.fieldsRepo.save(field);
  }

  async findAll(query: ListQuery & { id_card?: number; type?: FieldType; required?: boolean } = {}): Promise<Fields[]> {
    const where: Record<string, unknown> = {};
    if (query.id_card) where.card = { id_card: query.id_card };
    if (typeof query.type === 'number') where.type = query.type;
    if (typeof query.required === 'boolean') where.required = query.required;

    return await this.fieldsRepo.find({
      where,
      relations: { card: true, values: true },
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_field: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_field: number): Promise<Fields> {
    const field = await this.fieldsRepo.findOne({
      where: { id_field },
      relations: { card: true, values: true }
    });
    if (!field) throw new NotFoundException('Field not found');
    return field;
  }

  async findByCard(id_card: number): Promise<Fields[]> {
    return await this.fieldsRepo.find({
      where: { card: { id_card } },
      order: { id_field: 'ASC' }
    });
  }

  async update(id_field: number, changes: UpdateFieldDTO): Promise<Fields> {
    const field = await this.findById(id_field);
    if (changes.name !== undefined) field.name = changes.name;
    if (changes.type !== undefined) field.type = changes.type;
    if (changes.required !== undefined) field.required = changes.required;
    if (changes.options !== undefined) field.options = changes.options;
    return await this.fieldsRepo.save(field);
  }

  /**
   * Borra el campo junto con sus valores. Si el campo era requerido y la tarjeta
   * tiene respuestas, se avisa en vez de dejar la tarjeta inconsistente.
   */
  async remove(id_field: number): Promise<boolean> {
    const field = await this.findById(id_field);
    if (field.required && field.values?.length)
      throw new BadRequestException('Cannot remove a required field that already has values');

    await this.fieldsValuesRepo.delete({ field: { id_field } });
    const result = await this.fieldsRepo.delete({ id_field });
    if (!result.affected) throw new NotFoundException('Field not found');
    return true;
  }
}
