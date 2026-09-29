
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "./roles.entity";

@Entity('Nasked_Permissions')
export class Permissions {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_permission: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  permission: string;

  @ManyToMany(() => Roles, (r) => r.permissions)
  roles: Roles[];
}
