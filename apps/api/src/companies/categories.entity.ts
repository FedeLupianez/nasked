import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Companies } from "./companies.entity";

@Entity('Nasked_Categories')
export class Categories {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_category: number;

  @Column({ type: 'varchar', length: 255 })
  category: string;

  @ManyToMany(() => Companies, (cp) => cp.categories)
  companies: Companies[];
}

