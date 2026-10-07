import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { AccountsService } from '../accounts/accounts.service';
import { ListQuery } from '../common/dto/list-query.dto';

/**
 * Fachada de la capa de acceso. No habla con la base: compone Roles, Permissions
 * y la pertenencia de una cuenta a una empresa para resolver la pregunta tipica
 * de autorizacion ("que puede hacer esta persona dentro de esta empresa").
 */
@Injectable()
export class AccessService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
    private readonly accountsService: AccountsService
  ) { }

  async listRoles(query: ListQuery = {}) {
    return await this.rolesService.findAll(query);
  }

  async listPermissions(query: ListQuery = {}) {
    return await this.permissionsService.findAll(query);
  }

  /** Permisos efectivos de una cuenta dentro de una empresa, a traves de su rol. */
  async permissionsOf(id_account: string, id_company: number): Promise<string[]> {
    if (!id_account || !id_company)
      throw new BadRequestException('id_account and id_company are required');

    const links = await this.accountsService.companiesOf(id_account);
    const link = links.find((l) => l.id_company === id_company);
    if (!link) throw new NotFoundException('Account does not belong to this company');

    const role = await this.rolesService.findById(link.id_role);
    return (role.permissions ?? []).map((p) => p.permission);
  }

  /** Indica si la cuenta tiene un permiso concreto en la empresa. */
  async can(id_account: string, id_company: number, permission: string): Promise<boolean> {
    const permissions = await this.permissionsOf(id_account, id_company);
    return permissions.includes(permission);
  }
}
