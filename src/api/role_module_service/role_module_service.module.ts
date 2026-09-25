import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  RoleModuleService,
  RoleModuleServiceSchema,
  RoleTable,
  RoleTableSchema,
  User,
  UserSchema,
} from '../../schema/schema';

import { RoleModuleSerService } from './role_module_service.services';
import { RoleModuleSerController } from './role_module_service.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RoleModuleService.name,
        schema: RoleModuleServiceSchema,
      },
      {
        name: RoleTable.name,
        schema: RoleTableSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      }
    ]),
  ],
  controllers: [RoleModuleSerController],
  providers: [RoleModuleSerService],
  exports: [RoleModuleSerService],
})
export class RoleModuleServiceModule {}