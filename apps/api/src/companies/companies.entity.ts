import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Categories } from "./categories.entity";
import { AccountsCompanies } from "../accounts/accounts-companies.entity";
import { Plans } from "../business/plans.entity";
import { Folders } from "../elements/folders.entity";
import { Bills } from "../business/bills.entity";

export enum CompanyStatus {
  ACTIVE,
  INACTIVE,
  BANNED
}

@Entity('Nasked_Companies')
export class Companies {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_company: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  logo: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  created_at: Date;

  @Column({ type: 'enum', enum: CompanyStatus, default: CompanyStatus.ACTIVE })
  status: CompanyStatus;

  @ManyToMany(() => Categories, (c) => c.companies)
  @JoinTable({
    name: 'Companies_Categories',
    joinColumn: { name: 'id_company', referencedColumnName: 'id_company' },
    inverseJoinColumn: {
      name: 'id_category',
      referencedColumnName: 'id_category'
    }
  })
  categories: Categories[];

  @OneToMany(() => AccountsCompanies, (ac) => ac.company)
  accountsCompanies: AccountsCompanies[];

  @Column({ type: 'int', unsigned: true })
  id_plan: number;

  @ManyToOne(() => Plans, (p) => p.companies, { nullable: false })
  @JoinColumn({ name: 'id_plan', referencedColumnName: 'id_plan' })
  plan: Plans;

  @OneToMany(() => Folders, (f) => f.company)
  folders: Folders[];

  @OneToMany(() => Bills, (b) => b.company)
  bills: Bills[];
}
