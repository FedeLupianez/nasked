import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Companies } from "../companies/companies.entity";

@Entity('Nasked_Plans')
export class Plans {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_plan: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  @Column({ type: 'int', unsigned: true, nullable: false })
  employees: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => Companies, (c) => c.plan)
  companies: Companies[];
}
