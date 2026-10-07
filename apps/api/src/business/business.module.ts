import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { Plans } from './plans.entity';
import { Bills } from './bills.entity';
import { Payments } from './payments.entity';
import { PlansService } from './plans.service';
import { BillsService } from './bills.service';
import { PaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plans, Bills, Payments])],
  providers: [BusinessService, PlansService, BillsService, PaymentsService],
  controllers: [BusinessController],
  exports: [BusinessService, PlansService, BillsService, PaymentsService]
})
export class BusinessModule {}
