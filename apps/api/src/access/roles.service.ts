import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from './roles.entity';
import { CreateRoleDTO, SetRolePermissionsDTO, UpdateRoleDTO } from './dto/access.dto';
import { ListQuery } from '../common/dto/list-query.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepo: Repository<Roles>
  ) { }

  async create(dto: CreateRoleDTO): Promise<Roles> {
    const exists = await this.rolesRepo.exists({ where: { role: dto.role } });
    if (exists) throw new BadRequestException('Role already exists');
    return await this.rolesRepo.save(this.rolesRepo.create({ role: dto.role }));
  }

  async findAll(query: ListQuery = {}): Promise<Roles[]> {
    return await this.rolesRepo.find({
      relations: { permissions: true },
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_role: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_role: number): Promise<Roles> {
    const role = await this.rolesRepo.findOne({
      where: { id_role },
      relations: { permissions: true }
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findByName(role: string): Promise<Roles> {
    if (!role) throw new BadRequestException('Role is empty');
    const found = await this.rolesRepo.findOne({
      where: { role },
      relations: { permissions: true }
    });
    if (!found) throw new NotFoundException('Role not found');
    return found;
  }

  async update(id_role: number, changes: UpdateRoleDTO): Promise<Roles> {
    const role = await this.findById(id_role);
    if (changes.role === undefined) return role;
    if (changes.role !== role.role) {
      const taken = await this.rolesRepo.exists({ where: { role: changes.role } });
      if (taken) throw new BadRequestException('Role already exists');
    }
    role.role = changes.role;
    return await this.rolesRepo.save(role);
  }

  /** Agrega un permiso al rol. Idempotente: no falla si ya estaba vinculado. */
  async addPermission(id_role: number, dto: SetRolePermissionsDTO): Promise<Roles> {
    const role = await this.findById(id_role);
    const already = role.permissions?.some((p) => p.id_permission === dto.id_permission);
    if (!already) {
      role.permissions = [...(role.permissions ?? []), { id_permission: dto.id_permission } as any];
    }
    return await this.rolesRepo.save(role);
  }

  async removePermission(id_role: number, id_permission: number): Promise<Roles> {
    const role = await this.findById(id_role);
    role.permissions = (role.permissions ?? []).filter((p) => p.id_permission !== id_permission);
    return await this.rolesRepo.save(role);
  }

  async remove(id_role: number): Promise<boolean> {
    await this.findById(id_role);
    const result = await this.rolesRepo.delete({ id_role });
    if (!result.affected) throw new NotFoundException('Role not found');
    return true;
  }
}
