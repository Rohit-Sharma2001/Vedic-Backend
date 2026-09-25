// add_ons.controller.ts
import { Controller, Get, Post, Body, Request, Put, Param, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { RoleModuleSerService } from './role_module_service.services';
import { RoleTable, RoleModuleService, User } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('role_module_service')
@UseInterceptors(Base64Interceptor)
export class RoleModuleSerController {
  constructor(private readonly RoleModuleSerService: RoleModuleSerService) { }

  // ================= ADD MODULE =================

  @Post('add-module')
  async createModule(
    @Request() req: Request,
    @Body('data') data: string,
  ) {

    try {

      if (!data) {
        throw new HttpException(
          'Encrypted data is missing',
          HttpStatus.BAD_REQUEST,
        );
      }

      const decodedData = Buffer
        .from(data, 'base64')
        .toString('utf-8');

      const moduleData: Partial<RoleModuleService> =
        JSON.parse(decodedData);

      const createdModule =
        await this.RoleModuleSerService.createModule(moduleData);

      return {
        message: 'Module successfully added!',
        statusCode: 201,
        data: createdModule,
      };

    } catch (error) {

      throw new HttpException(
        error.message ||
        'Invalid encrypted data format or server error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ================= ADD ROLE =================

  @Post('add-role')
  async createRole(
    @Request() req: Request,
    @Body('data') data: string,
  ) {

    try {

      if (!data) {
        throw new HttpException(
          'Encrypted data is missing',
          HttpStatus.BAD_REQUEST,
        );
      }

      const decodedData = Buffer
        .from(data, 'base64')
        .toString('utf-8');

      const roleData: Partial<RoleTable> =
        JSON.parse(decodedData);

      const createdRole =
        await this.RoleModuleSerService.createRole(roleData);

      return {
        message: 'Role successfully added!',
        statusCode: 201,
        data: createdRole,
      };

    } catch (error) {

      throw new HttpException(
        error.message ||
        'Invalid encrypted data format or server error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('edit-role/:id')
  async updateRole(
    @Param('id') id: string,
    @Body('data') data: string,
  ) {
    try {
      if (!data) {
        throw new HttpException(
          'Encrypted data is missing',
          HttpStatus.BAD_REQUEST,
        );
      }

      const decodedData = Buffer
        .from(data, 'base64')
        .toString('utf-8');

      const roleData: Partial<RoleTable> =
        JSON.parse(decodedData);

      const updatedRole =
        await this.RoleModuleSerService.updateRole(
          id,
          roleData,
        );

      return {
        message: 'Role successfully updated!',
        statusCode: 200,
        data: updatedRole,
      };
    } catch (error) {
      throw new HttpException(
        error.message ||
        'Invalid encrypted data format or server error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('delete-role/:id')
async deleteRole(
  @Param('id') id: string,
) {
  try {
    const deletedRole =
      await this.RoleModuleSerService.deleteRole(id);

    return {
      message: 'Role successfully deleted!',
      statusCode: 200,
      data: deletedRole,
    };
  } catch (error) {
    throw new HttpException(
      error.message || 'Server error',
      HttpStatus.BAD_REQUEST,
    );
  }
}

  @Post('all-modules')
  async findAllModules() {
    console.log("dsjhgcbuwecuaewcwecwehcwcd")
    const modules = await this.RoleModuleSerService.findAllModules();
    return { message: 'All Modules fetched successfully', statusCode: 200, data: modules };
  }

  @Post('all-roles')
  async findAllRoles() {
    console.log("dsjhgcbuwecuaewcwecwehcwcd")
    const roles = await this.RoleModuleSerService.findAllRoles();
    return { message: 'All Roles fetched successfully', statusCode: 200, data: roles };
  }

  @Post('assign-modules')
  async assignModules(
    @Body('data') data: string,
  ) {

    try {

      if (!data) {
        throw new Error('Data is required');
      }

      // Decode Base64
      const decodedData =
        Buffer.from(data, 'base64').toString('utf-8');

      const body = JSON.parse(decodedData);

      console.log(body, 'decoded body');

      // IMPORTANT FIX
      const arr = body.data || [];

      if (!Array.isArray(arr)) {
        throw new Error('Payload data must be array');
      }

      const result =
        await this.RoleModuleSerService.assignModulesToRoles(arr);

      return {
        statusCode: 200,
        message: 'Modules assigned successfully',
        data: result,
      };

    } catch (error) {

      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('assign-role')
  async assignRole(@Body('data') data: string) {

    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const body = JSON.parse(decodedData);

      const result =
        await this.RoleModuleSerService.assignRoleToUser(body);

      return {
        statusCode: 200,
        message: 'Role assigned successfully',
        data: result,
      };

    } catch (error) {

      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  @Post('get-user-modules')
  async getUserModules(@Body('data') data: string) {

    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const body = JSON.parse(decodedData);

      const result =
        await this.RoleModuleSerService.getUserModules(body);

      return {
        statusCode: 200,
        message: 'Modules fetched successfully',
        data: result,
      };

    } catch (error) {

      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('get-all-modules')
  async getAllModules(@Body('data') data: string) {

    try {

      // Decode Base64
      const decodedData = Buffer
        .from(data, 'base64')
        .toString('utf-8');

      const body = JSON.parse(decodedData);

      const result =
        await this.RoleModuleSerService.getAllModules(body);

      return {
        statusCode: 200,
        message: 'All Modules fetched successfully',
        data: result,
      };

    } catch (error) {

      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }


}
