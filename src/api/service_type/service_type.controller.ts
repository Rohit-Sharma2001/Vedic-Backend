// File: service_type.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceTypeService } from './service_type.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express } from 'express';

@Controller('service_type')
@UseInterceptors(Base64Interceptor)
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      if (!data) throw new Error('Encrypted data is missing');
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);

      result.created_at = new Date();
      result.updated_at = new Date();

      const created = await this.serviceTypeService.create(result);
      return { message: 'Service type added!', statusCode: 201, data: created };
    } catch (error) {
      return { message: 'Error', statusCode: 400, error: error.message };
    }
  }

@Post('getAll')
async findAll(@Body('data') data: any) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result: any = JSON.parse(decodedData);

    const page = result.page || 1;
    const pageSize = result.pageSize || 10;
    const centerId = result.centerId || null;
    const search = result.search || '';       // <-- ADD THIS

    return this.serviceTypeService.findAll(centerId, page, pageSize, search);
  } catch (error) {
    return { message: 'Fetch error', statusCode: 500, error: error.message };
  }
}


  @Post('view')
  async findOne(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);
      const id = result.id;
      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID', statusCode: 400 };
      return await this.serviceTypeService.findOneById(id);
    } catch (error) {
      return { message: 'View error', statusCode: 500, error: error.message };
    }
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      if (!data) throw new Error('Missing data');
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const updates: any = JSON.parse(decodedData);

      updates.updated_at = new Date();

      return await this.serviceTypeService.updateServiceType(id, updates);
    } catch (error) {
      return { message: 'Update error', statusCode: 400, error: error.message };
    }
  }

  @Post('delete')
  async delete(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);
      const id = result.id;
      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID', statusCode: 400 };
      return await this.serviceTypeService.deleteServiceType(id);
    } catch (error) {
      return { message: 'Delete error', statusCode: 500, error: error.message };
    }
  }

  @Post('toggleStatus')
async toggleStatus(@Body('data') data: any) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result: any = JSON.parse(decodedData);
    const id = result.id;

    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ID', statusCode: 400 };
    }

    return await this.serviceTypeService.toggleStatus(id);
  } catch (error) {
    return { message: 'Toggle error', statusCode: 500, error: error.message };
  }
}

}