// src/modules/doshas_cms/doshas_cms.controller.ts
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
import { DoshasCmsService } from './doshas_cms.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { DoshasCmsContent } from 'src/schema/schema';
import { Types } from 'mongoose';

@Controller('doshas_cms')
@UseInterceptors(Base64Interceptor)
export class DoshasCmsController {
  constructor(private readonly doshasCmsService: DoshasCmsService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] ,image?:Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<DoshasCmsContent> = JSON.parse(decodedData);

      if (files?.file?.[0]) {
        parsedData.banner_image = files.file[0].path;
      }
       if (files?.image?.[0]) {
        parsedData.bottom_quote_image = files.image[0].path;
      }

      const created = await this.doshasCmsService.create(parsedData);

      return {
        message: 'Doshas CMS content added successfully!',
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

      return await this.doshasCmsService.findOneById(id);
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
    @UploadedFiles() files: { file?: Express.Multer.File[],image?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing or undefined');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<DoshasCmsContent> = JSON.parse(decodedData);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }
      if (files?.file?.[0]) {
        parsedData.banner_image = files.file[0].path;
      }
       if (files?.image?.[0]) {
        parsedData.bottom_quote_image = files.image[0].path;
      }

      const updated = await this.doshasCmsService.update(id, parsedData);

      return {
        message: 'Doshas CMS content updated successfully!',
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
