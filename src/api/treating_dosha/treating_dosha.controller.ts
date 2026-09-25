// src/modules/treating_dosha/treating_dosha.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { TreatingDoshaService } from './treating_dosha.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { TreatingDoshaImbalance } from 'src/schema/schema';
import { Types } from 'mongoose';

@Controller('treating_dosha')
@UseInterceptors(Base64Interceptor)
export class TreatingDoshaController {
  constructor(private readonly treatingDoshaService: TreatingDoshaService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<TreatingDoshaImbalance> = JSON.parse(decodedData);

      if (files?.file?.[0]) {
        parsedData.banner_image = files.file[0].path;
      }

      const created = await this.treatingDoshaService.create(parsedData);

      return {
        message: 'Treating dosha imbalance entry added successfully!',
        statusCode: 201,
        data: created,
      };
    } catch (error) {
      return {
        message: 'Error creating entry',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('view')
  async view(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decodedData);
      const id = parsed.id;

      return await this.treatingDoshaService.findOneById(id);
    } catch (error) {
      return {
        message: 'Error fetching entry',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('update/:id')
//   @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body() body: any
  ) {
    try {
      const data = body.data;
      if (!data) {
        throw new Error('Encrypted data is missing or undefined');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<TreatingDoshaImbalance> = JSON.parse(decodedData);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      if (files?.file?.[0]) {
        parsedData.banner_image = files.file[0].path;
      }

      const updated = await this.treatingDoshaService.update(id, parsedData);

      return {
        message: 'Treating dosha imbalance entry updated successfully!',
        statusCode: 200,
        data: updated,
      };
    } catch (error) {
      return {
        message: 'Error updating entry',
        statusCode: 400,
        error: error.message,
      };
    }
  }
}