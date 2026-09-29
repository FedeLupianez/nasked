import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module';
import { AccessModule } from '../access/access.module';
import { BusinessModule } from '../business/business.module';
import { CompaniesModule } from '../companies/companies.module';
import { ElementsModule } from '../elements/elements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      autoLoadEntities: true,

      synchronize: false,
    }),
    AccountsModule,
    AccessModule,
    BusinessModule,
    CompaniesModule,
    ElementsModule
  ],
})
export class AppModule { }
