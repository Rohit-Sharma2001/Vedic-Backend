// src/modules/membership_management/membership_management.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { MembershipManagementService } from './membership_management.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Express } from 'express';
import { Types } from 'mongoose';

@Controller('membership_management')
@UseInterceptors(Base64Interceptor)
export class MembershipManagementController {
  constructor(private readonly membershipService: MembershipManagementService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);

      if (files.image && files.image[0]) {
        result['image'] = files.image[0].path;
      }

      result.created_date = new Date();
      result.modified_date = new Date();

      const created = await this.membershipService.create(result);

      return {
        message: 'Membership plan added successfully!',
        statusCode: 201,
        data: created,
      };
    } catch (error) {
      return {
        message: 'Failed to add membership plan',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('getAll')
  async findAll(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);

      const page = result.page || 1;
      const pageSize = result.pageSize || 10;
      const userMembershipId = result.userMembershipId

      return await this.membershipService.findAll(page, pageSize,userMembershipId);
    } catch (error) {
      return {
        message: 'Error fetching membership plans',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('view')
  async findOne(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);
      const id = result.id;

      if (!Types.ObjectId.isValid(id)) {
        return { message: 'Invalid ObjectId', statusCode: 400 };
      }
      const userMembershipId = result.userMembershipId

      return await this.membershipService.findOneById(id,userMembershipId);
    } catch (error) {
      return {
        message: 'Error fetching membership plan',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);

      if (files.image && files.image[0]) {
        result['image'] = files.image[0].path;
      }

      return await this.membershipService.update(id, result);
    } catch (error) {
      return {
        message: 'Error updating membership plan',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('delete')
  async delete(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);
      const id = result.id;

      if (!Types.ObjectId.isValid(id)) {
        return { message: 'Invalid ObjectId format', statusCode: 400 };
      }

      return await this.membershipService.delete(id);
    } catch (error) {
      return {
        message: 'Error deleting membership plan',
        statusCode: 500,
        error: error.message,
      };
    }
  }

 @Post('toggle-status')
async togglePlanStatus(@Body('data') data: string) {
  try {
    if (!data) throw new Error('Encrypted data is missing');

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result = JSON.parse(decodedData);
    const id = result.id;

    if (!id) {
      return { statusCode: 400, message: 'Plan ID is required' };
    }

    return this.membershipService.togglePlanStatus(id);
  } catch (error) {
    return { statusCode: 400, message: error.message };
  }
}

@Post('set-bestvalue')
async setBestValue(@Body('data') data: string) {
  try {
    if (!data) throw new Error('Encrypted data is missing');

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result = JSON.parse(decodedData);
    const id = result.id;

    if (!id) {
      return { statusCode: 400, message: 'Plan ID is required' };
    }

    return this.membershipService.setBestValue(id);
  } catch (error) {
    return { statusCode: 400, message: error.message };
  }
}


}
