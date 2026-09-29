import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Fields } from "./fields.entity";

@Entity('Nasked_FieldsValues')
export class FieldsValues {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_field_value: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  value: string;

  @ManyToOne(() => Fields, (f) => f.values, { nullable: false })
  @JoinColumn({ name: 'id_field', referencedColumnName: 'id_field' })
  field: Fields;
}
