import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Folders } from "./folders.entity";
import { Fields } from "./fields.entity";

@Entity('Nasked_Cards')
export class Cards {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_card: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp' })
  deadline: Date;

  @ManyToOne(() => Folders, (f) => f.cards, { nullable: false })
  @JoinColumn({ name: 'id_folder', referencedColumnName: 'id_folder' })
  folder: Folders;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => Fields, (f) => f.card)
  fields: Fields[];
}
