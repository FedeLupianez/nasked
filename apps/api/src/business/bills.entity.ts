import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Companies } from "../companies/companies.entity";
import { Payments } from "./payments.entity";

export enum BillStatus {
  PENDING,
  PAID,
  EXPIRED,
  INACTIVE
}

@Entity('Nasked_Bills')
export class Bills {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_bill: number;

  @ManyToOne(() => Companies, (c) => c.bills, { nullable: false })
  @JoinColumn({ name: 'id_company', referencedColumnName: 'id_company' })
  company: Companies;

  @Column({ type: 'varchar', length: 6, nullable: false })
  invoice_num: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.PENDING })
  status: BillStatus;

  @Column({ type: 'varchar', length: 255, nullable: false })
  detail: string;

  @Column({ type: 'float', default: 0.0 })
  discount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issue_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  next_billing: Date;

  @Column({ type: 'timestamp', nullable: false })
  period_start: Date;

  @Column({ type: 'timestamp', nullable: false })
  period_end: Date;

  @Column({ type: 'char', length: 3, nullable: false })
  currency: string;

  @OneToMany(() => Payments, (p) => p.bill)
  payments: Payments[];
}
