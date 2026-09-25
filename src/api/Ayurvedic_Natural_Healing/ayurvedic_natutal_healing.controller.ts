// src/modules/ayurvedic_healing/ayurvedic_healing.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AyurVedicNaturalHealingService } from './ayurvedic_natutal_healing.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { AyurVedicNaturalHealing } from 'src/schema/schema';
import { Types } from 'mongoose';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ayurvedic_healing')
@UseInterceptors(Base64Interceptor)
export class AyurVedicHealingController {
  constructor(
    private readonly ayurvedicService: AyurVedicNaturalHealingService,
  ) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<AyurVedicNaturalHealing> = JSON.parse(decodedData);

      if (files.file && files.file[0]) {
        parsedData.file = files.file[0].path;
      }

      const createdEntry = await this.ayurvedicService.create(parsedData);

      return {
        message: 'Ayurvedic entry added successfully!',
        statusCode: 201,
        data: createdEntry,
      };
    } catch (error) {
      return {
        message: 'Error creating entry',
        statusCode: 400,
        error: error.message,
      };
    }
  }



  @Post('viewAll')
  async viewAll(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const queryData = JSON.parse(decodedData);

      const page = queryData.page || 1;
      const pageSize = queryData.pageSize || 10;

      return await this.ayurvedicService.findAll(page, pageSize);
    } catch (error) {
      return {
        message: 'Error fetching entries',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  @Post('view')
  async viewOne(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData = JSON.parse(decodedData);
      const id = parsedData.id;

      return await this.ayurvedicService.findOneById(id);
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

      // Decode base64
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData = JSON.parse(decodedData);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // If file exists, update file path
      if (files?.file?.[0]) {
        parsedData['file'] = files.file[0].path;
      }

      const updated = await this.ayurvedicService.update(id, parsedData);

      return {
        message: 'Ayurvedic entry successfully updated!',
        statusCode: 200,
        data: updated,
      };
    } catch (error) {
      return {
        message: 'Error updating Ayurvedic entry',
        statusCode: 400,
        error: error.message,
      };
    }
  }
}





