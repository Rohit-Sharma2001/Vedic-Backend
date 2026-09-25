// src/modules/balancing_diet/balancing_diet.controller.ts

import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { BalancingDietService } from './balancing_diet.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { BalancingDiet } from 'src/schema/schema';
import { Types } from 'mongoose';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('balancing_diet')
@UseInterceptors(Base64Interceptor)
export class BalancingDietController {
  constructor(private readonly dietService: BalancingDietService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<BalancingDiet> = JSON.parse(decodedData);

      if (files.file && files.file[0]) {
        parsedData.file = files.file[0].path;
      }

      const created = await this.dietService.create(parsedData);

      return {
        message: 'BalancingDiet entry added successfully!',
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

      return await this.dietService.findOneById(id);
    } catch (error) {
      return {
        message: 'Error fetching entry',
        statusCode: 500,
        error: error.message,
      };
    }
  }

    @Post('search-by-type')
  async searchByType(@Body('data') data: string) {
    try {
      if (!data) {
        return {
          message: '"data" field is required',
          statusCode: 400,
        };
      }

      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      const type = parsed.type;

      if (!type) {
        return {
          message: '"type" field is required in payload',
          statusCode: 400,
        };
      }

      const result = await this.dietService.findByType(type);

      return {
        message: 'Entries fetched successfully',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error searching by type',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string
  ) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing or undefined');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<BalancingDiet> = JSON.parse(decodedData);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      if (files?.file?.[0]) {
        parsedData['file'] = files.file[0].path;
      }

      const updated = await this.dietService.update(id, parsedData);

      return {
        message: 'BalancingDiet entry updated successfully!',
        statusCode: 200,
        data: updated,
      };
    } catch (error) {
      return {
        message: 'Error updating BalancingDiet entry',
        statusCode: 400,
        error: error.message,
      };
    }
  }
}