import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Companies } from './companies.entity';
import { CreateCompany } from './dto/create.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Companies)
    private readonly companiesRepo: Repository<Companies>
  ) { }

  async create(company: CreateCompany): Promise<Companies> {
    const newCompany = this.companiesRepo.create({
      name: company.name,
      logo: company.logo,
      id_plan: company.id_plan
    });
    const stored = await this.companiesRepo.save(newCompany);
    if (!newCompany)
      throw new InternalServerErrorException('Error creating company');
    return stored;
  }
}
