import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RefreshTokens } from './refreshTokens.entity';
import { CreateRefreshTokenDTO, UpdateRefreshTokenDTO } from './dto/refresh-token.dto';
import { ListQuery } from '../common/dto/list-query.dto';

/**
 * CRUD de refresh tokens. Casi todo lo usa `AuthService`, que es quien emite y
 * rota los tokens; los metodos de revocacion son los que hacen util el servicio
 * desde el resto de la app (logout, cambio de password, baja de cuenta).
 */
@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshTokens)
    private readonly tokensRepo: Repository<RefreshTokens>
  ) { }

  async create(dto: CreateRefreshTokenDTO): Promise<RefreshTokens> {
    const token = this.tokensRepo.create({
      tokenHashed: Buffer.from(dto.tokenHashed, 'hex'),
      email: dto.email,
      limit_date: dto.limit_date ? new Date(dto.limit_date) : undefined
    });
    return await this.tokensRepo.save(token);
  }

  async findAll(query: ListQuery & { email?: string } = {}): Promise<RefreshTokens[]> {
    return await this.tokensRepo.find({
      where: query.email ? { email: query.email } : {},
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_token: 'DESC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_token: number): Promise<RefreshTokens> {
    const token = await this.tokensRepo.findOne({ where: { id_token } });
    if (!token) throw new NotFoundException('Refresh token not found');
    return token;
  }

  /** Busca por el hash del token y el email de la cuenta. */
  async findByHash(tokenHashed: Buffer, email: string): Promise<RefreshTokens> {
    if (!Buffer.isBuffer(tokenHashed)) throw new BadRequestException('tokenHashed must be a Buffer');
    const token = await this.tokensRepo.findOne({
      where: { tokenHashed, email },
      relations: { account: true }
    });
    if (!token) throw new NotFoundException('Refresh token not found');
    return token;
  }

  async update(id_token: number, changes: UpdateRefreshTokenDTO): Promise<RefreshTokens> {
    const token = await this.findById(id_token);
    if (changes.limit_date !== undefined) token.limit_date = new Date(changes.limit_date);
    return await this.tokensRepo.save(token);
  }

  async remove(id_token: number): Promise<boolean> {
    await this.findById(id_token);
    const result = await this.tokensRepo.delete({ id_token });
    if (!result.affected) throw new NotFoundException('Refresh token not found');
    return true;
  }

  /** Revoga el token de una sesion concreta (logout). */
  async revoke(tokenHashed: Buffer, email: string): Promise<boolean> {
    const result = await this.tokensRepo.delete({ tokenHashed, email });
    if (!result.affected) throw new NotFoundException('Refresh token not found');
    return true;
  }

  /** Cierra todas las sesiones de una cuenta (cambio de password, baja). */
  async revokeAllForEmail(email: string): Promise<number> {
    if (!email) throw new BadRequestException('Email is empty');
    const result = await this.tokensRepo.delete({ email });
    return result.affected ?? 0;
  }

  /** Limpia los tokens ya vencidos. Pensado para un job, no para un request. */
  async purgeExpired(): Promise<number> {
    const result = await this.tokensRepo.delete({ limit_date: LessThan(new Date()) });
    return result.affected ?? 0;
  }
}
