import { BeforeInsert, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';


@Entity('Nasked_RefreshTokens')
export class RefreshTokens {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_token: number;

  @Index()
  @Column({ type: 'binary', length: 32 })
  tokenHashed: Buffer;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  limit_date: Date;

  @BeforeInsert()
  setLimitDate() {
    const limit = new Date();
    limit.setDate(this.created_at.getDate() + Number(process.env.RT_DAYS));
    this.limit_date = limit;
  }


}
