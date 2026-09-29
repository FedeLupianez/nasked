import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module';
import { AccessModule } from '../access/access.module';
import { BusinessModule } from '../business/business.module';
import { CompaniesModule } from '../companies/companies.module';
import { ElementsModule } from '../elements/elements.module';
import { AuthModule } from '../auth/auth.module';
import { dataSourceOptions } from '../database/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    AccountsModule,
    AccessModule,
    BusinessModule,
    CompaniesModule,
    ElementsModule,
    AuthModule
  ],
})
export class AppModule { }
