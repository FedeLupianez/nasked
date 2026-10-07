import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Companies, CompanyStatus } from './companies.entity';
import { CreateCompany, UpdateCompanyDTO } from './dto/create.dto';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Categories } from './categories.entity';
import { ListQuery } from '../common/dto/list-query.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Companies)
    private readonly companiesRepo: Repository<Companies>,
    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>
  ) { }

  async create(company: CreateCompany): Promise<Companies> {
    const newCompany = this.companiesRepo.create({
      name: company.name,
      logo: company.logo,
      id_plan: company.id_plan
    });
    const stored = await this.companiesRepo.save(newCompany);
    if (!stored)
      throw new InternalServerErrorException('Error creating company');

    if (company.categories?.length)
      stored.categories = await this.resolveCategories(company.categories);

    return await this.companiesRepo.save(stored);
  }

  async findAll(query: ListQuery & { status?: CompanyStatus; search?: string } = {}): Promise<Companies[]> {
    const where: FindOptionsWhere<Companies>[] = [];
    if (typeof query.status === 'number') where.push({ status: query.status });
    if (query.search) where.push({ name: Like(`%${query.search}%`) });

    return await this.companiesRepo.find({
      where,
      relations: { categories: true, plan: true },
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_company: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_company: number): Promise<Companies> {
    const company = await this.companiesRepo.findOne({
      where: { id_company },
      relations: { categories: true, plan: true }
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async findByName(name: string): Promise<Companies> {
    const found = await this.companiesRepo.findOne({ where: { name } });
    if (!found) throw new NotFoundException('Company not found');
    return found;
  }

  async update(id_company: number, changes: UpdateCompanyDTO): Promise<Companies> {
    const company = await this.findById(id_company);

    if (changes.name !== undefined) company.name = changes.name;
    if (changes.logo !== undefined) company.logo = changes.logo;
    if (changes.id_plan !== undefined) company.id_plan = changes.id_plan;
    if (changes.status !== undefined) company.status = changes.status;

    // Las categorias llegan por nombre; reemplazan el set completo.
    if (changes.categories !== undefined)
      company.categories = await this.resolveCategories(changes.categories);

    return await this.companiesRepo.save(company);
  }

  async setStatus(id_company: number, status: CompanyStatus): Promise<Companies> {
    const company = await this.findById(id_company);
    company.status = status;
    return await this.companiesRepo.save(company);
  }

  async remove(id_company: number): Promise<boolean> {
    await this.findById(id_company);
    const result = await this.companiesRepo.delete({ id_company });
    if (!result.affected) throw new NotFoundException('Company not found');
    return true;
  }

  /** Resuelve nombres de categoria a entidades, creandolas si no existen. */
  private async resolveCategories(names: string[]): Promise<Categories[]> {
    const unique = [...new Set(names.filter(Boolean))];
    if (!unique.length) return [];

    const found = await this.categoriesRepo.find({ where: { category: In(unique) } });
    const missing = unique.filter((n) => !found.some((c) => c.category === n));

    const created = missing.length
      ? await this.categoriesRepo.save(missing.map((category) => this.categoriesRepo.create({ category })))
      : [];

    return [...found, ...created];
  }
}
