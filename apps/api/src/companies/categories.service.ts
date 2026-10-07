import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Categories } from './categories.entity';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dto/create.dto';
import { ListQuery } from '../common/dto/list-query.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>
  ) { }

  async create(dto: CreateCategoryDTO): Promise<Categories> {
    const exists = await this.categoriesRepo.exists({ where: { category: dto.category } });
    if (exists) throw new BadRequestException('Category already exists');
    return await this.categoriesRepo.save(this.categoriesRepo.create({ category: dto.category }));
  }

  async findAll(query: ListQuery & { search?: string } = {}): Promise<Categories[]> {
    return await this.categoriesRepo.find({
      where: query.search ? { category: Like(`%${query.search}%`) } : {},
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { category: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_category: number): Promise<Categories> {
    const category = await this.categoriesRepo.findOne({
      where: { id_category },
      relations: { companies: true }
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findByNames(categories: string[]): Promise<Categories[]> {
    if (!categories?.length) return [];
    return await this.categoriesRepo.find({ where: { category: In(categories) } });
  }

  async update(id_category: number, changes: UpdateCategoryDTO): Promise<Categories> {
    const category = await this.findById(id_category);
    if (changes.category === undefined) return category;
    if (changes.category !== category.category) {
      const taken = await this.categoriesRepo.exists({ where: { category: changes.category } });
      if (taken) throw new BadRequestException('Category already exists');
    }
    category.category = changes.category;
    return await this.categoriesRepo.save(category);
  }

  async remove(id_category: number): Promise<boolean> {
    await this.findById(id_category);
    const result = await this.categoriesRepo.delete({ id_category });
    if (!result.affected) throw new NotFoundException('Category not found');
    return true;
  }
}
