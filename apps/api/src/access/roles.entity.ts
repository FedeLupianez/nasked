import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permissions } from "./permissions.entity";
import { AccountsCompanies } from "../accounts/accounts-companies.entity";

@Entity('Nasked_Roles')
export class Roles {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_role: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  role: string;


  @ManyToMany(() => Permissions, (p) => p.roles)
  @JoinTable({
    name: 'Roles_Permissions',
    joinColumn: { name: 'id_role', referencedColumnName: 'id_role' },
    inverseJoinColumn: {
      name: 'id_permission',
      referencedColumnName: 'id_permission'
    }
  })
  permissions: Permissions[];

  @OneToMany(() => AccountsCompanies, (ac) => ac.role)
  accountsCompanies: AccountsCompanies[];
}
