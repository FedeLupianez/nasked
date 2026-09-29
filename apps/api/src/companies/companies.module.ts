import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Companies } from './companies.entity';
import { Categories } from './categories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Companies, Categories])],
  providers: [CompaniesService],
  controllers: [CompaniesController]
})
export class CompaniesModule {}
