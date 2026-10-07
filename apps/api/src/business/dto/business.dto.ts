import {
  IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString,
  Matches, MaxLength, Min,
} from 'class-validator';
import { BillStatus } from '../bills.entity';
import { PaymentStatus } from '../payments.entity';

/* ------------------------------------------------------------------ Plans */

export class CreatePlanDTO {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  description: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  employees: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  active?: boolean;
}

export class UpdatePlanDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  employees?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  active?: boolean;
}

/* ------------------------------------------------------------------ Bills */

export class CreateBillDTO {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  id_company: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(6)
  invoice_num: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  detail: string;

  /** Codigo ISO 4217 de 3 letras. */
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/, { message: 'currency must be a 3 letter ISO code' })
  currency: string;

  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsDateString()
  next_billing?: string;

  @IsNotEmpty()
  @IsDateString()
  period_start: string;

  @IsNotEmpty()
  @IsDateString()
  period_end: string;
}

export class UpdateBillDTO {
  @IsOptional()
  @IsString()
  @MaxLength(6)
  invoice_num?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  detail?: string;

  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/, { message: 'currency must be a 3 letter ISO code' })
  currency?: string;

  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsDateString()
  next_billing?: string;

  @IsOptional()
  @IsDateString()
  period_start?: string;

  @IsOptional()
  @IsDateString()
  period_end?: string;
}

/* --------------------------------------------------------------- Payments */

export class CreatePaymentDTO {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  id_bill: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  provider_txn_id?: string;

  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/, { message: 'currency must be a 3 letter ISO code' })
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  paid_at?: string;
}

export class UpdatePaymentDTO {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  provider_txn_id?: string;

  @IsOptional()
  @Matches(/^[A-Za-z]{3}$/, { message: 'currency must be a 3 letter ISO code' })
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
