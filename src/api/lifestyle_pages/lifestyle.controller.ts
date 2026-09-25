// src/modules/lifestyle_pages/lifestyle.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { LifestyleService } from './lifestyle.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Lifestyle } from 'src/schema/schema';
import { Types } from 'mongoose';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('lifestyle')
@UseInterceptors(Base64Interceptor)
export class LifestyleController {
  constructor(private readonly lifestyleService: LifestyleService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<Lifestyle> = JSON.parse(decodedData);

      if (files.file && files.file[0]) {
        parsedData.file = files.file[0].path;
      }

      const created = await this.lifestyleService.create(parsedData);

      return {
        message: 'Lifestyle entry added successfully!',
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

      return await this.lifestyleService.findOneById(id);
    } catch (error) {
      return {
        message: 'Error fetching entry',
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
      const parsedData: Partial<Lifestyle> = JSON.parse(decodedData);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      if (files?.file?.[0]) {
        parsedData.file = files.file[0].path;
      }

      const updated = await this.lifestyleService.update(id, parsedData);

      return {
        message: 'Lifestyle entry updated successfully!',
        statusCode: 200,
        data: updated,
      };
    } catch (error) {
      return {
        message: 'Error updating Lifestyle entry',
        statusCode: 400,
        error: error.message,
      };
    }
  }


@Post('search')
async searchByType(@Body('data') data: string) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const parsed = JSON.parse(decodedData);

    if (!parsed.type) {
      throw new Error('Missing `type` in request data');
    }

    return await this.lifestyleService.searchByType(parsed.type);
  } catch (error) {
    return {
      message: 'Error searching entries',
      statusCode: 400,
      error: error.message,
    };
  }
}
}