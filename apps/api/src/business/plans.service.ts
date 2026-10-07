import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Plans } from './plans.entity';
import { CreatePlanDTO, UpdatePlanDTO } from './dto/business.dto';
import { ListQuery } from '../common/dto/list-query.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plans)
    private readonly plansRepo: Repository<Plans>
  ) { }

  async create(dto: CreatePlanDTO): Promise<Plans> {
    const exists = await this.plansRepo.exists({ where: { name: dto.name } });
    if (exists) throw new BadRequestException('Plan already exists');
    return await this.plansRepo.save(
      this.plansRepo.create({
        name: dto.name,
        description: dto.description,
        employees: dto.employees,
        active: dto.active ?? true
      })
    );
  }

  async findAll(query: ListQuery & { active?: boolean; search?: string } = {}): Promise<Plans[]> {
    const where: Record<string, unknown> = {};
    if (typeof query.active === 'boolean') where.active = query.active;
    if (query.search) where.name = Like(`%${query.search}%`);

    return await this.plansRepo.find({
      where,
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_plan: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_plan: number): Promise<Plans> {
    const plan = await this.plansRepo.findOne({ where: { id_plan } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async update(id_plan: number, changes: UpdatePlanDTO): Promise<Plans> {
    const plan = await this.findById(id_plan);
    if (changes.name !== undefined) plan.name = changes.name;
    if (changes.description !== undefined) plan.description = changes.description;
    if (changes.employees !== undefined) plan.employees = changes.employees;
    if (changes.active !== undefined) plan.active = !!changes.active;
    return await this.plansRepo.save(plan);
  }

  /**
   * Los planes no se borran si tienen empresas dado que la FK es NOT NULL:
   * primero hay que desactivar y reasignar, despues remove.
   */
  async remove(id_plan: number): Promise<boolean> {
    await this.findById(id_plan);
    const inUse = await this.plansRepo.query(
      'SELECT COUNT(*) AS total FROM Nasked_Companies WHERE id_plan = ?',
      [id_plan]
    );
    const total = Number(inUse?.[0]?.total ?? 0);
    if (total > 0)
      throw new BadRequestException(`Plan is in use by ${total} companies`);

    const result = await this.plansRepo.delete({ id_plan });
    if (!result.affected) throw new NotFoundException('Plan not found');
    return true;
  }
}
