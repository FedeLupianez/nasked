import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Cards } from "./cards.entity";
import { FieldsValues } from "./fieldsValues.entity";

export enum FieldType {
  NUMBER,
  TEXT,
  DATE,
  TIME,
  DATETIME
};

@Entity('Nasked_Fields')
export class Fields {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_field: number;

  @ManyToOne(() => Cards, (c) => c.fields, { nullable: false })
  @JoinColumn({ name: 'id_card', referencedColumnName: 'id_card' })
  card: Cards;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'boolean', default: false })
  required: boolean;

  @Column({ type: 'json' })
  options: string;

  @OneToMany(() => FieldsValues, (fv) => fv.field)
  values: FieldsValues[];

  @Column({ type: 'enum', enum: FieldType, default: FieldType.TEXT })
  type: FieldType;
}
