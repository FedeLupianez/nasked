import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Companies } from "../companies/companies.entity";
import { Cards } from "./cards.entity";
import { Accounts } from "../accounts/accounts.entity";

@Entity('Nasked_Folders')
export class Folders {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_folder: number;

  @Column({ type: 'varchar', length: 6, nullable: true })
  token: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ManyToOne(() => Companies, (c) => c.folders, { nullable: false })
  @JoinColumn({ name: 'id_company', referencedColumnName: 'id_company' })
  company: Companies;

  @ManyToOne(() => Folders, (f) => f.children)
  @JoinColumn({ name: 'belong_id', referencedColumnName: 'id_folder' })
  belongs_to: Folders;

  @OneToMany(() => Folders, (f) => f.belongs_to)
  children: Folders[];

  @OneToMany(() => Cards, (c) => c.folder)
  cards: Cards[];

  @ManyToMany(() => Accounts, (a) => a.folders)
  @JoinTable({
    name: 'Accounts_Folders',
    joinColumn: { name: 'id_folder', referencedColumnName: 'id_folder' },
    inverseJoinColumn: {
      name: 'id_account',
      referencedColumnName: 'id_account'
    }
  })
  accounts: Accounts[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
