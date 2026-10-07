import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldsValues } from './fieldsValues.entity';
import { CreateFieldValueDTO, CreateFieldValuesDTO, UpdateFieldValueDTO } from './dto/elements.dto';
import { ListQuery } from '../common/dto/list-query.dto';
import { Fields } from './fields.entity';

/**
 * Valores concretos de los campos de una tarjeta. Varias filas pueden apuntar al
 * mismo campo (un campo admite N respuestas).
 */
@Injectable()
export class FieldsValuesService {
  constructor(
    @InjectRepository(FieldsValues)
    private readonly fieldsValuesRepo: Repository<FieldsValues>
  ) { }

  async create(dto: CreateFieldValueDTO): Promise<FieldsValues> {
    const value = this.fieldsValuesRepo.create({
      value: dto.value,
      // `id_field` es una FK implicita (JoinColumn).
      field: { id_field: dto.id_field } as Fields
    });
    return await this.fieldsValuesRepo.save(value);
  }

  /** Carga multiple de respuestas para un mismo campo. */
  async createMany(dto: CreateFieldValuesDTO & { id_field: number }): Promise<FieldsValues[]> {
    if (!dto.id_field) throw new BadRequestException('id_field is required');
    if (!dto.values?.length) return [];

    const values = dto.values.map((value) =>
      this.fieldsValuesRepo.create({
        value,
        field: { id_field: dto.id_field } as Fields
      })
    );
    return await this.fieldsValuesRepo.save(values);
  }

  async findAll(query: ListQuery & { id_field?: number } = {}): Promise<FieldsValues[]> {
    return await this.fieldsValuesRepo.find({
      where: query.id_field ? { field: { id_field: query.id_field } } : {},
      relations: { field: true },
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_field_value: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_field_value: number): Promise<FieldsValues> {
    const value = await this.fieldsValuesRepo.findOne({
      where: { id_field_value },
      relations: { field: true }
    });
    if (!value) throw new NotFoundException('Field value not found');
    return value;
  }

  async findByField(id_field: number): Promise<FieldsValues[]> {
    if (!id_field) throw new BadRequestException('id_field is required');
    return await this.fieldsValuesRepo.find({
      where: { field: { id_field } },
      order: { id_field_value: 'ASC' }
    });
  }

  async update(id_field_value: number, changes: UpdateFieldValueDTO): Promise<FieldsValues> {
    const value = await this.findById(id_field_value);
    if (changes.value === undefined) return value;
    value.value = changes.value;
    return await this.fieldsValuesRepo.save(value);
  }

  async remove(id_field_value: number): Promise<boolean> {
    await this.findById(id_field_value);
    const result = await this.fieldsValuesRepo.delete({ id_field_value });
    if (!result.affected) throw new NotFoundException('Field value not found');
    return true;
  }

  /** Reemplaza todas las respuestas de un campo por las indicadas. */
  async replaceForField(id_field: number, values: string[]): Promise<FieldsValues[]> {
    await this.fieldsValuesRepo.delete({ field: { id_field } });
    return await this.createMany({ id_field, values });
  }
}
