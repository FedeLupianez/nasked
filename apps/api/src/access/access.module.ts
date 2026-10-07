import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { PermissionsService } from './permissions.service';
import { RolesService } from './roles.service';
import { Permissions } from './permissions.entity';
import { Roles } from './roles.entity';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permissions, Roles]), AccountsModule],
  providers: [AccessService, RolesService, PermissionsService],
  controllers: [AccessController],
  exports: [AccessService, RolesService, PermissionsService]
})
export class AccessModule {}
