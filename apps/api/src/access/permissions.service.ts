import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permissions } from './permissions.entity';
import { CreatePermissionDTO, UpdatePermissionDTO } from './dto/access.dto';
import { ListQuery } from '../common/dto/list-query.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permissions)
    private readonly permissionsRepo: Repository<Permissions>
  ) { }

  async create(dto: CreatePermissionDTO): Promise<Permissions> {
    const exists = await this.permissionsRepo.exists({ where: { permission: dto.permission } });
    if (exists) throw new BadRequestException('Permission already exists');
    return await this.permissionsRepo.save(this.permissionsRepo.create({ permission: dto.permission }));
  }

  async findAll(query: ListQuery = {}): Promise<Permissions[]> {
    return await this.permissionsRepo.find({
      order: query.orderBy
        ? { [query.orderBy]: query.order ?? 'ASC' }
        : { id_permission: 'ASC' },
      skip: query.skip,
      take: query.limit
    });
  }

  async findById(id_permission: number): Promise<Permissions> {
    const permission = await this.permissionsRepo.findOne({
      where: { id_permission },
      relations: { roles: true }
    });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async findByName(permission: string): Promise<Permissions> {
    if (!permission) throw new BadRequestException('Permission is empty');
    const found = await this.permissionsRepo.findOne({ where: { permission } });
    if (!found) throw new NotFoundException('Permission not found');
    return found;
  }

  async update(id_permission: number, changes: UpdatePermissionDTO): Promise<Permissions> {
    const permission = await this.findById(id_permission);
    if (changes.permission === undefined) return permission;
    if (changes.permission !== permission.permission) {
      const taken = await this.permissionsRepo.exists({ where: { permission: changes.permission } });
      if (taken) throw new BadRequestException('Permission already exists');
    }
    permission.permission = changes.permission;
    return await this.permissionsRepo.save(permission);
  }

  async remove(id_permission: number): Promise<boolean> {
    await this.findById(id_permission);
    const result = await this.permissionsRepo.delete({ id_permission });
    if (!result.affected) throw new NotFoundException('Permission not found');
    return true;
  }
}
