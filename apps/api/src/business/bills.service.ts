import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Bills, BillStatus } from './bills.entity';
import { CreateBillDTO, UpdateBillDTO } from './dto/business.dto';
import { ListQuery } from '../common/dto/list-query.dto';
import { Companies } from '../companies/companies.entity';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bills)
    private readonly billsRepo: Repository<Bills>
  ) { }

  async create(dto: CreateBillDTO): Promise<Bills> {
    const duplicated = await this.billsRepo.exists({ where: { invoice_num: dto.invoice_num } });
    if (duplicated) throw new BadRequestException('Invoice number already exists');

    const bill = this.billsRepo.create({
      // `id_company` es una FK implicita (JoinColumn), no una columna mapeada.
      company: { id_company: dto.id_company } as Companies,
      invoice_num: dto.invoice_num,
      price: dto.price,
      detail: dto.detail,
      currency: dto.currency.toUpperCase(),
      status: dto.status ?? BillStatus.PENDING,
      discount: dto.discount ?? 0,
      issue_date: new Date(),
      next_billing: dto.next_billing ? new Date(dto.next_billing) : null,
      period_start: new Date(dto.period_start),
      period_end: new Date(dto.period_end)
    });
    return await this.billsRepo.save(bill);
  }

  async findAll(query: ListQuery & {
    id_company?: number;
    status?: BillStatus;
    from?: string;
    to?: string;
  } = {}): Promise<Bills[]> {
    return await this.billsRepo.find({
      where: this.buildWhere(query),
      relations: { company: true, payments: true },
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_bill: 'DESC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_bill: number): Promise<Bills> {
    const bill = await this.billsRepo.findOne({
      where: { id_bill },
      relations: { company: true, payments: true }
    });
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async findByCompany(id_company: number): Promise<Bills[]> {
    return await this.billsRepo.find({
      where: { company: { id_company } },
      relations: { company: true, payments: true },
      order: { id_bill: 'DESC' }
    });
  }

  async update(id_bill: number, changes: UpdateBillDTO): Promise<Bills> {
    const bill = await this.findById(id_bill);

    if (changes.invoice_num !== undefined) {
      const taken = await this.billsRepo.exists({
        where: { invoice_num: changes.invoice_num }
      });
      if (taken && changes.invoice_num !== bill.invoice_num)
        throw new BadRequestException('Invoice number already exists');
      bill.invoice_num = changes.invoice_num;
    }
    if (changes.price !== undefined) bill.price = changes.price;
    if (changes.detail !== undefined) bill.detail = changes.detail;
    if (changes.discount !== undefined) bill.discount = changes.discount;
    if (changes.status !== undefined) bill.status = changes.status;
    if (changes.currency !== undefined) bill.currency = changes.currency.toUpperCase();
    if (changes.next_billing !== undefined)
      bill.next_billing = changes.next_billing ? new Date(changes.next_billing) : null;
    if (changes.period_start !== undefined) bill.period_start = new Date(changes.period_start);
    if (changes.period_end !== undefined) bill.period_end = new Date(changes.period_end);

    return await this.billsRepo.save(bill);
  }

  async setStatus(id_bill: number, status: BillStatus): Promise<Bills> {
    const bill = await this.findById(id_bill);
    bill.status = status;
    return await this.billsRepo.save(bill);
  }

  /** Nasked_Payments.id_bill es NOT NULL, asi que no se puede borrar un facturado con pagos. */
  async remove(id_bill: number): Promise<boolean> {
    const bill = await this.findById(id_bill);
    if (bill.payments?.length)
      throw new BadRequestException(`Bill has ${bill.payments.length} payments and cannot be deleted`);

    const result = await this.billsRepo.delete({ id_bill });
    if (!result.affected) throw new NotFoundException('Bill not found');
    return true;
  }

  private buildWhere(query: ListQuery & {
    id_company?: number;
    status?: BillStatus;
    from?: string;
    to?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (query.id_company) where.company = { id_company: query.id_company };
    if (typeof query.status === 'number') where.status = query.status;
    if (query.from || query.to) {
      // Rango cerrado sobre issue_date.
      where.issue_date = query.from && query.to
        ? Between(new Date(query.from), new Date(query.to))
        : query.from
          ? MoreThanOrEqual(new Date(query.from))
          : LessThanOrEqual(new Date(query.to));
    }
    return where;
  }
}
