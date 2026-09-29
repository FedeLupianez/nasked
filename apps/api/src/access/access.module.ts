import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { Permissions } from './permissions.entity';
import { Roles } from './roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permissions, Roles])],
  providers: [AccessService],
  controllers: [AccessController]
})
export class AccessModule {}
