import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Accounts } from './accounts.entity';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { RegisterDTO } from '../auth/dto/register.dto';
import { AccountsCompanies } from './accounts-companies.entity';
import { CreateAccountDTO, UpdateAccountDTO } from './dto/accounts.dto';
import { ListQuery } from '../common/dto/list-query.dto';
import { toUuidBuffer, toUuidString } from '../common/uuid';
import { hash } from 'argon2';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Accounts)
    private readonly accountsRepo: Repository<Accounts>,
    @InjectRepository(AccountsCompanies)
    private readonly accountsCompaniesRepo: Repository<AccountsCompanies>
  ) { }

  async create(account: RegisterDTO | CreateAccountDTO): Promise<Accounts> {
    const already_exists = await this.accountsRepo.exists({ where: { email: account.email } });
    if (already_exists)
      throw new BadRequestException('Email has already has an account');
    const newAccount = this.accountsRepo.create({
      email: account.email,
      password: account.password,
      lastname: account.lastname,
      name: account.name,
      profile_image: (account as CreateAccountDTO).profile_image
    })
    return await this.accountsRepo.save(newAccount);
  }

  async getByEmail(email: string): Promise<Accounts> {
    if (!email) throw new BadRequestException('Email is empty');
    const account = await this.accountsRepo.findOne({
      where: { email: email },
      relations: { accountsCompanies: true }
    })
    return account;
  }

  /** Devuelve la cuenta junto con sus vinculos a empresas. */
  async findById(id_account: string): Promise<Accounts> {
    const account = await this.accountsRepo.findOne({
      where: { id_account: toUuidBuffer(id_account) },
      relations: { accountsCompanies: true }
    });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  /**
   * Listado paginado. `active` filtra por el flag y `search` por nombre/apellido.
   */
  async findAll(query: ListQuery & { active?: boolean; search?: string } = {}): Promise<Accounts[]> {
    const where: FindOptionsWhere<Accounts>[] = [];
    if (typeof query.active === 'boolean') where.push({ active: query.active });
    if (query.search)
      where.push({ name: Like(`%${query.search}%`) }, { lastname: Like(`%${query.search}%`) });

    return await this.accountsRepo.find({
      where,
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { email: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findByIds(ids: string[]): Promise<Accounts[]> {
    if (!ids?.length) return [];
    return await this.accountsRepo.find({
      where: { id_account: In(ids.map((id) => toUuidBuffer(id))) }
    });
  }

  /**
   * Actualizacion parcial. Se patchea contra la entidad leida para no perder
   * defaults, y `profile_image` solo se toca si viene en el DTO.
   */
  async update(id_account: string, changes: UpdateAccountDTO): Promise<Accounts> {
    const account = await this.findById(id_account);

    if (changes.name !== undefined) account.name = changes.name;
    if (changes.lastname !== undefined) account.lastname = changes.lastname;
    if (changes.profile_image !== undefined) account.profile_image = changes.profile_image;
    if (changes.active !== undefined) account.active = changes.active;
    // `hashPasswd` solo corre en @BeforeInsert, asi que el hash se rehace aqui.
    if (changes.password !== undefined) {
      account.password = await hash(changes.password, { secret: Buffer.from(process.env.ARGON_SECRET) });
    }

    return await this.accountsRepo.save(account);
  }

  /** Baja logica: marca la cuenta como inactiva en vez de borrarla. */
  async remove(id_account: string): Promise<Accounts> {
    const account = await this.findById(id_account);
    if (!account.active) throw new BadRequestException('Account is already inactive');
    account.active = false;
    return await this.accountsRepo.save(account);
  }

  /** Borrado fisico. Libera antes los vinculos para no violar el FK. */
  async hardRemove(id_account: string): Promise<boolean> {
    const account = await this.findById(id_account);
    await this.accountsCompaniesRepo.delete({ id_account: account.id_account });
    const result = await this.accountsRepo.delete({ id_account: account.id_account });
    if (!result.affected) throw new NotFoundException('Account not found');
    return true;
  }

  async joinToCompany(id_account: string, id_company: number, id_role: number): Promise<boolean> {
    if (!id_account || !id_company || !id_role)
      throw new BadRequestException('Invalid args');
    const buffer = toUuidBuffer(id_account);
    const already_joined = await this.accountsCompaniesRepo.exists({
      where: { id_account: buffer, id_company }
    });
    if (already_joined)
      throw new BadRequestException('Account already joined to this company');

    const relation = this.accountsCompaniesRepo.create({
      id_account: buffer,
      id_company: id_company,
      id_role: id_role
    })
    const stored = await this.accountsCompaniesRepo.save(relation);
    if (!stored)
      throw new InternalServerErrorException('Error creating relation');
    return true;
  }

  /** Empresas a las que pertenece una cuenta, via su rol asignado. */
  async companiesOf(id_account: string): Promise<AccountsCompanies[]> {
    return await this.accountsCompaniesRepo.find({
      where: { id_account: toUuidBuffer(id_account) },
      relations: { company: true, role: true }
    });
  }

  /** Expone el id binario como UUID string, que es la forma que usa el JWT. */
  toPublicId(account: Accounts): string {
    return toUuidString(account.id_account);
  }
}
