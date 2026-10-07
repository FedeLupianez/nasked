import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsCompanies } from './accounts-companies.entity';
import { CreateAccountsCompaniesDTO, UpdateAccountsCompaniesDTO } from './dto/accounts.dto';
import { ListQuery } from '../common/dto/list-query.dto';
import { toUuidBuffer } from '../common/uuid';

/**
 * CRUD de la vinculo cuenta <-> empresa <-> rol. El indice unico
 * `UQ_Accounts_Companies` es sobre (account, company), asi que una misma cuenta
 * no puede estar dos veces en la misma empresa con roles distintos.
 */
@Injectable()
export class AccountsCompaniesService {
  constructor(
    @InjectRepository(AccountsCompanies)
    private readonly accountsCompaniesRepo: Repository<AccountsCompanies>
  ) { }

  async create(dto: CreateAccountsCompaniesDTO): Promise<AccountsCompanies> {
    const relation = this.accountsCompaniesRepo.create({
      id_account: toUuidBuffer(dto.id_account),
      id_company: dto.id_company,
      id_role: dto.id_role
    });
    return await this.accountsCompaniesRepo.save(relation);
  }

  async findAll(query: ListQuery & { id_company?: number; id_account?: string; id_role?: number } = {}): Promise<AccountsCompanies[]> {
    const where: Record<string, unknown> = {};
    if (query.id_company) where.id_company = query.id_company;
    if (query.id_account) where.id_account = toUuidBuffer(query.id_account);
    if (query.id_role) where.id_role = query.id_role;

    return await this.accountsCompaniesRepo.find({
      where,
      relations: { company: true, role: true, account: true },
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_account_company: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_account_company: number): Promise<AccountsCompanies> {
    const relation = await this.accountsCompaniesRepo.findOne({
      where: { id_account_company },
      relations: { company: true, role: true, account: true }
    });
    if (!relation) throw new NotFoundException('Relation not found');
    return relation;
  }

  /** Roles que una empresa tiene asignados, agrupados por cuenta. */
  async findByCompany(id_company: number): Promise<AccountsCompanies[]> {
    if (!id_company) throw new BadRequestException('id_company is required');
    return await this.accountsCompaniesRepo.find({
      where: { id_company },
      relations: { account: true, role: true },
      order: { id_account_company: 'ASC' }
    });
  }

  async update(id_account_company: number, changes: UpdateAccountsCompaniesDTO): Promise<AccountsCompanies> {
    const relation = await this.findById(id_account_company);
    if (changes.id_role !== undefined) relation.id_role = changes.id_role;
    return await this.accountsCompaniesRepo.save(relation);
  }

  /** Desvincula la cuenta de la empresa. */
  async remove(id_account_company: number): Promise<boolean> {
    await this.findById(id_account_company);
    const result = await this.accountsCompaniesRepo.delete({ id_account_company });
    if (!result.affected) throw new NotFoundException('Relation not found');
    return true;
  }

  /** Desvincula una cuenta concreta de una empresa concreta. */
  async removeByAccountAndCompany(id_account: string, id_company: number): Promise<boolean> {
    const result = await this.accountsCompaniesRepo.delete({
      id_account: toUuidBuffer(id_account),
      id_company
    });
    if (!result.affected) throw new NotFoundException('Relation not found');
    return true;
  }
}
