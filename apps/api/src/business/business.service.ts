import { Injectable } from '@nestjs/common';
import { PlansService } from './plans.service';
import { BillsService } from './bills.service';
import { PaymentsService } from './payments.service';
import { ListQuery } from '../common/dto/list-query.dto';

/**
 * Fachada del modulo de facturacion. El CRUD por entidad vive en PlansService,
 * BillsService y PaymentsService; aca quedan las consultas que las cruzan.
 */
@Injectable()
export class BusinessService {
  constructor(
    private readonly plansService: PlansService,
    private readonly billsService: BillsService,
    private readonly paymentsService: PaymentsService
  ) { }

  async listPlans(query: ListQuery = {}) {
    return await this.plansService.findAll(query);
  }

  async listBills(query: ListQuery = {}) {
    return await this.billsService.findAll(query);
  }

  async listPayments(query: ListQuery = {}) {
    return await this.paymentsService.findAll(query);
  }

  /** Total facturado de una empresa en un rango de facturacion. */
  async billedTotal(id_company: number, from: string, to: string): Promise<number> {
    const bills = await this.billsService.findByCompany(id_company);
    const start = new Date(from).getTime();
    const end = new Date(to).getTime();

    return bills
      .filter((b) => b.issue_date && b.issue_date.getTime() >= start && b.issue_date.getTime() <= end)
      .reduce((acc, b) => acc + Number(b.price ?? 0) - Number(b.discount ?? 0), 0);
  }
}
