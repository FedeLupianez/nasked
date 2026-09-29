import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Accounts } from './accounts.entity';
import { Repository } from 'typeorm';
import { RegisterDTO } from '../auth/auth.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Accounts)
    private readonly accountsRepo: Repository<Accounts>
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
}
