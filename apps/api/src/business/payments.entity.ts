import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Bills } from "./bills.entity";

export enum PaymentStatus {
  SUCCESS,
  ERROR,
  RETURNED
}

@Entity('Nasked_Payments')
export class Payments {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_payment: number;

  @ManyToOne(() => Bills, (b) => b.payments, { nullable: false })
  @JoinColumn({ name: 'id_bill', referencedColumnName: 'id_bill' })
  bill: Bills;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paid_at: Date;

  @Column({ type: 'varchar', length: 255 })
  provider_txn_id: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'char', length: 3 })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.SUCCESS })
  status: PaymentStatus;
}
