import { Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Accounts } from "./accounts.entity";
import { Companies } from "../companies/companies.entity";
import { Roles } from "../access/roles.entity";

@Entity('Accounts_Companies')
@Index('UQ_Accounts_Companies', ['account', 'company'], { unique: true })
export class AccountsCompanies {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_account_company: number;

  @ManyToOne(() => Accounts, (a) => a.accountsCompanies, { nullable: false })
  @JoinColumn({ name: 'id_account', referencedColumnName: 'id_account' })
  account: Accounts;

  @ManyToOne(() => Companies, (c) => c.accountsCompanies, { nullable: false })
  @JoinColumn({ name: 'id_company', referencedColumnName: 'id_company' })
  company: Companies;

  @ManyToOne(() => Roles, (r) => r.accountsCompanies, { nullable: false })
  @JoinColumn({ name: 'id_role', referencedColumnName: 'id_role' })
  role: Roles;
}
