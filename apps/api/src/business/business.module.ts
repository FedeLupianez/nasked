import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { Plans } from './plans.entity';
import { Bills } from './bills.entity';
import { Payments } from './payments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plans, Bills, Payments])],
  providers: [BusinessService],
  controllers: [BusinessController]
})
export class BusinessModule {}
