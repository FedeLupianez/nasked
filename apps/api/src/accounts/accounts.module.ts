import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Accounts } from './accounts.entity';
import { AccountsCompanies } from './accounts-companies.entity';
import { AccountsCompaniesService } from './accounts-companies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Accounts, AccountsCompanies])],
  controllers: [AccountsController],
  providers: [AccountsService, AccountsCompaniesService],
  exports: [AccountsService, AccountsCompaniesService]
})
export class AccountsModule { }
