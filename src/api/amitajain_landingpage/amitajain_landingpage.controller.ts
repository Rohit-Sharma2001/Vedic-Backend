// src/modules/amitajain_landingpage/amitajain_landingpage.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Request,
  Param,
} from '@nestjs/common';
import { AmitaJainLandingPageService } from './amitajain_landingpage.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('amitajain_landingpage')
@UseInterceptors(Base64Interceptor)
export class AmitaJainLandingPageController {
  constructor(private readonly service: AmitaJainLandingPageService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] ,image?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData = JSON.parse(decodedData);

      if (files.file && files.file[0]) {
        parsedData.file = files.file[0].path;
      }
      if (files.image && files.image[0]) {
        parsedData.image = files.image[0].path;
      }

      const createdEntry = await this.service.createOrUpdate(parsedData);

      return {
        message: 'Amita Jain Landing Page entry added successfully!',
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

  @Post('view')
  async get() {
    try {
      const data = await this.service.get();
      return {
        message: 'Data fetched successfully',
        statusCode: 200,
        data,
      };
    } catch (err) {
      return {
        message: 'Error fetching data',
        statusCode: 500,
        error: err.message,
      };
    }
  }

  @Post('update/:id')
  // @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] ,image?: Express.Multer.File[]  },
    @Body('data') data: string
  ) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing or undefined');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData = JSON.parse(decodedData);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      if (files?.file?.[0]) {
        parsedData.file = files.file[0].path;
      }
        if (files?.image?.[0]) {
        parsedData.image = files.image[0].path;
      }

      const updated = await this.service.update(id, parsedData);

      return {
        message: 'Amita Jain Landing Page entry updated successfully!',
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
