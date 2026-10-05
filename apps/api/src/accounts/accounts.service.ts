import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Accounts } from './accounts.entity';
import { Repository } from 'typeorm';
import { RegisterDTO } from '../auth/dto/register.dto';
import { AccountsCompanies } from './accounts-companies.entity';
import { parse } from 'uuid';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Accounts)
    private readonly accountsRepo: Repository<Accounts>,
    @InjectRepository(AccountsCompanies)
    private readonly accountsCompaniesRepo: Repository<AccountsCompanies>
  ) { }

  async create(account: RegisterDTO): Promise<Accounts> {
    const already_exists = await this.accountsRepo.exists({ where: { email: account.email } });
    if (already_exists)
      throw new BadRequestException('Email has already has an account');
    const newAccount = this.accountsRepo.create({
      email: account.email,
      password: account.password,
      lastname: account.lastname,
      name: account.name
    })
    return await this.accountsRepo.save(newAccount);
  }

  async getByEmail(email: string): Promise<Accounts> {
    if (!email) throw new BadRequestException('Email is empty');
    const account = await this.accountsRepo.findOne({
      where: { email: email },
      relations: { accountsCompanies: true }
    })
    return account;
  }

  async joinToCompany(id_account: string, id_company: number, id_role: number): Promise<boolean> {
    if (!id_account || !id_company || !id_role)
      throw new BadRequestException('Invalid args');
    const relation = this.accountsCompaniesRepo.create({
      id_account: Buffer.from(parse(id_account)),
      id_company: id_company,
      id_role: id_role
    })
    const stored = await this.accountsCompaniesRepo.save(relation);
    if (!stored)
      throw new InternalServerErrorException('Error creating relation');
  }
}
