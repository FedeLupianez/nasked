import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AccountsCompanies } from "./accounts-companies.entity";
import { hash } from "argon2";

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

  @BeforeInsert()
  async hashPasswd() {
    this.password = await hash(this.password, { secret: Buffer.from(process.env.ARGON_SECRET) })
  }

  @BeforeInsert()
  defaultImage() {
    if (!this.profile_image)
      this.profile_image = `https://ui-avatars.com/api/?name=${this.name}+${this.lastname}&background=0D8ABC&color=fff&size=128`
  }

}
