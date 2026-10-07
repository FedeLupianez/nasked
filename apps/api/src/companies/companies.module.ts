import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Companies } from './companies.entity';
import { Categories } from './categories.entity';
import { CategoriesService } from './categories.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  // AuthModule: CompaniesController necesita AuthService para crear la cuenta
  // del owner al registrar la empresa.
  imports: [TypeOrmModule.forFeature([Companies, Categories]), AuthModule],
  providers: [CompaniesService, CategoriesService],
  controllers: [CompaniesController],
  exports: [CompaniesService, CategoriesService]
})
export class CompaniesModule {}
