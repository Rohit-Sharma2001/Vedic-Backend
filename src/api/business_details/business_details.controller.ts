// File: src/modules/business_detail/business_detail.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Express } from 'express';
import { BusinessDetailService } from './business_details.services';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';

@Controller('business_detail')
@UseInterceptors(Base64Interceptor)
export class BusinessDetailController {
  constructor(private readonly service: BusinessDetailService) {}

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

      const created = await this.service.create(result);
      return { message: 'Business detail added!', statusCode: 201, data: created };
    } catch (error) {
      return { message: 'Error', statusCode: 400, error: (error as Error).message };
    }
  }

  @Post('getAll')
  async findAll(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);

      const page = result.page || 1;
      const pageSize = result.pageSize || 10;
      const search = result.search || '';

      return this.service.findAll(page, pageSize, search);
    } catch (error) {
      return { message: 'Fetch error', statusCode: 500, error: (error as Error).message };
    }
  }

  @Post('view')
  async findOne(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);
      const id = result.id;
      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID', statusCode: 400 };
      return await this.service.findOneById(id);
    } catch (error) {
      return { message: 'View error', statusCode: 500, error: (error as Error).message };
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

      return await this.service.updateBusinessDetail(id, updates);
    } catch (error) {
      return { message: 'Update error', statusCode: 400, error: (error as Error).message };
    }
  }

  @Post('delete')
  async delete(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);
      const id = result.id;
      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID', statusCode: 400 };
      return await this.service.deleteBusinessDetail(id);
    } catch (error) {
      return { message: 'Delete error', statusCode: 500, error: (error as Error).message };
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

      return await this.service.toggleStatus(id);
    } catch (error) {
      return { message: 'Toggle error', statusCode: 500, error: (error as Error).message };
    }
  }
}


