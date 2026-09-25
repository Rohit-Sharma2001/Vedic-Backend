// role-module.services.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoleModuleService, RoleTable, User, UserDocument } from '../../schema/schema';

@Injectable()
export class RoleModuleSerService {
  constructor(
    @InjectModel(RoleModuleService.name) private RoleModuleServiceModel: Model<RoleModuleService>,
    @InjectModel(RoleTable.name) private RoleTableModel: Model<RoleTable>,
    @InjectModel(User.name) private userModel: Model<UserDocument>

  ) { }

  // ================= CREATE MODULE =================

  async createModule(
    data: Partial<RoleModuleService>,
  ): Promise<RoleModuleService> {

    const createdModule =
      new this.RoleModuleServiceModel(data);

    return createdModule.save();
  }

  // ================= CREATE ROLE =================

  async createRole(
    data: Partial<RoleTable>,
  ): Promise<RoleTable> {

    const createdRole =
      new this.RoleTableModel(data);

    return createdRole.save();
  }

  async updateRole(
    id: string,
    data: Partial<RoleTable>,
  ): Promise<RoleTable> {

    const updatedRole =
      await this.RoleTableModel.findByIdAndUpdate(
        id,
        data,
        { new: true },
      );

    if (!updatedRole) {
      throw new Error('Role not found');
    }

    return updatedRole;
  }

  async deleteRole(
    id: string,
  ): Promise<RoleTable> {

    const deletedRole =
      await this.RoleTableModel.findByIdAndDelete(id);

    if (!deletedRole) {
      throw new Error('Role not found');
    }

    return deletedRole;
  }

  async findAllModules(): Promise<RoleModuleService[]> {
    return this.RoleModuleServiceModel.find().exec();
  }

  async findAllRoles(): Promise<RoleTable[]> {
    return this.RoleTableModel.find().exec();
  }

  async assignModulesToRoles(data: any[]) {

    const results = await Promise.all(

      data.map(async (item) => {

        console.log(item, 'role item');

        const roleId =
          new Types.ObjectId(item.roleId);

        const moduleObjectIds =
          (item.roleModuleIds || []).map(
            (id: string) =>
              new Types.ObjectId(id),
          );

        const updatedRole =
          await this.RoleTableModel.findByIdAndUpdate(
            roleId,
            {
              $set: {
                roleModuleIds: moduleObjectIds,
                modified: new Date(),
              },
            },
            {
              new: true,
            },
          );

        console.log(updatedRole, 'updatedRole');

        return updatedRole;
      }),
    );

    return results;
  }

  // update roleId in ObjectId 
  async assignRoleToUser(data: any) {

    const { userId, roleId } = data;

    const updatedUser =
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          roleId: new Types.ObjectId(roleId),
          modified: new Date(),
        },
        { new: true },
      );

    return updatedUser;
  }


  async getUserModules(data: any) {

    const { userId } = data;

    // Find User
    const user = await this.userModel
      .findById(userId)
      .lean();

    if (!user) {
      throw new Error('User not found');
    }

    // Find Role
    const role = await this.RoleTableModel
      .findById(user.roleId)
      .lean();

    if (!role) {
      throw new Error('Role not found');
    }

    // Get Modules
    const modules =
      await this.RoleModuleServiceModel.find({
        _id: {
          $in: role.roleModuleIds,
        },
        status: 1,
      }).lean();

    // Parent Modules
    const parentModules =
      modules.filter(
        (item: any) => !item.parent_id,
      );

    // Child Modules
    const childModules =
      modules.filter(
        (item: any) => item.parent_id,
      );

    // Create Tree
    const finalData = parentModules.map((parent: any) => {

      return {
        ...parent,
        children: childModules.filter(
          (child: any) =>
            child.parent_id.toString() ===
            parent._id.toString(),
        ),
      };
    });

    return finalData;
  }


  async getAllModules(data: any) {

    // Get all active modules
    const modules =
      await this.RoleModuleServiceModel
        .find({
          status: 1,
        })
        .lean();

    // Parent Modules
    const parentModules =
      modules.filter(
        (item: any) => !item.parent_id,
      );

    // Child Modules
    const childModules =
      modules.filter(
        (item: any) => item.parent_id,
      );

    // Final Tree Structure
    const finalData =
      parentModules.map((parent: any) => {

        return {

          moduleId: parent._id,

          moduleName: parent.moduleName,

          children:
            childModules
              .filter(
                (child: any) =>
                  child.parent_id.toString() ===
                  parent._id.toString(),
              )
              .map((child: any) => ({

                moduleId: child._id,

                moduleName: child.moduleName,

              })),
        };
      });

    return finalData;
  }






}
