import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AccountsCompanies } from "./accounts-companies.entity";

@Entity('Nasked_Accounts')
export class Accounts {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_account: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastname: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 2048 })
  profile_image: string;

  @OneToMany(() => AccountsCompanies, (ac) => ac.account)
  accountsCompanies: AccountsCompanies[];

  @Column({ type: 'boolean', default: true })
  active: boolean;

}
