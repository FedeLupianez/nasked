import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Accounts } from './accounts.entity';
import { AccountsCompanies } from './accounts-companies.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Accounts, AccountsCompanies])],
  controllers: [AccountsController],
  providers: [AccountsService]
})
export class AccountsModule {}
