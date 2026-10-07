import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Payments, PaymentStatus } from './payments.entity';
import { CreatePaymentDTO, UpdatePaymentDTO } from './dto/business.dto';
import { ListQuery } from '../common/dto/list-query.dto';
import { Bills } from './bills.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payments)
    private readonly paymentsRepo: Repository<Payments>,
    @InjectRepository(Bills)
    private readonly billsRepo: Repository<Bills>
  ) { }

  async create(dto: CreatePaymentDTO): Promise<Payments> {
    const status = dto.status ?? PaymentStatus.SUCCESS;

    // Un pago exitoso tiene que apuntar a una factura existente: si la FK se
    // cumple sola, el cobro queda asociado a una fila que no existe todavia.
    if (status === PaymentStatus.SUCCESS) {
      const bill = await this.billsRepo.findOne({ where: { id_bill: dto.id_bill } });
      if (!bill) throw new NotFoundException('Bill not found');
    }

    const payment = this.paymentsRepo.create({
      // `id_bill` es una FK implicita (JoinColumn), no una columna mapeada.
      bill: { id_bill: dto.id_bill } as Bills,
      amount: dto.amount,
      provider_txn_id: dto.provider_txn_id,
      currency: dto.currency?.toUpperCase(),
      status,
      paid_at: dto.paid_at ? new Date(dto.paid_at) : new Date()
    });
    return await this.paymentsRepo.save(payment);
  }

  async findAll(query: ListQuery & {
    id_bill?: number;
    status?: PaymentStatus;
    from?: string;
    to?: string;
  } = {}): Promise<Payments[]> {
    const where: Record<string, unknown> = {};
    if (query.id_bill) where.bill = { id_bill: query.id_bill };
    if (typeof query.status === 'number') where.status = query.status;
    if (query.from || query.to) {
      where.paid_at = query.from && query.to
        ? Between(new Date(query.from), new Date(query.to))
        : query.from
          ? MoreThanOrEqual(new Date(query.from))
          : LessThanOrEqual(new Date(query.to));
    }

    return await this.paymentsRepo.find({
      where,
      relations: { bill: true },
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_payment: 'DESC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_payment: number): Promise<Payments> {
    const payment = await this.paymentsRepo.findOne({
      where: { id_payment },
      relations: { bill: true }
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  /** Busca por el identificador que devuelve el proveedor de pagos. */
  async findByProviderTxnId(provider_txn_id: string): Promise<Payments> {
    if (!provider_txn_id) throw new BadRequestException('provider_txn_id is empty');
    const payment = await this.paymentsRepo.findOne({
      where: { provider_txn_id },
      relations: { bill: true }
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id_payment: number, changes: UpdatePaymentDTO): Promise<Payments> {
    const payment = await this.findById(id_payment);
    if (changes.amount !== undefined) payment.amount = changes.amount;
    if (changes.provider_txn_id !== undefined) payment.provider_txn_id = changes.provider_txn_id;
    if (changes.status !== undefined) payment.status = changes.status;
    if (changes.currency !== undefined) payment.currency = changes.currency.toUpperCase();
    return await this.paymentsRepo.save(payment);
  }

  async setStatus(id_payment: number, status: PaymentStatus): Promise<Payments> {
    const payment = await this.findById(id_payment);
    payment.status = status;
    return await this.paymentsRepo.save(payment);
  }

  async remove(id_payment: number): Promise<boolean> {
    await this.findById(id_payment);
    const result = await this.paymentsRepo.delete({ id_payment });
    if (!result.affected) throw new NotFoundException('Payment not found');
    return true;
  }
}
