// src/modules/review/review.controller.ts
import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query } from '@nestjs/common';

import { ReviewService } from './review.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Review } from 'src/schema/schema';
import { Types } from 'mongoose';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('review')
@UseInterceptors(Base64Interceptor)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<Review> = JSON.parse(decodedData);

      if (files?.file?.[0]) {
        parsedData.file = files.file[0].path;
      }

      const created = await this.reviewService.create(parsedData);

      return {
        message: 'Review page entry added successfully!',
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

      return await this.reviewService.findOneById(id);
    } catch (error) {
      return {
        message: 'Error fetching entry',
        statusCode: 500,
        error: error.message,
      };
    }
  }

@Post('update/:id')
@UseInterceptors(
  AnyFilesInterceptor({
    storage: diskStorage({
      destination: './uploads/images',
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `file-${Date.now()}${ext}`;
        cb(null, uniqueName);
      },
    }),
  }),
)
async update(
  @Param('id') id: string,
  @UploadedFiles() uploadedFiles: Express.Multer.File[],
  @Body('data') data: string,
) {
  try {
    if (!data) throw new Error('Missing base64-encoded data');
    if (!Types.ObjectId.isValid(id)) throw new Error('Invalid MongoDB ObjectId');

    const parsedData: Partial<Review> = JSON.parse(Buffer.from(data, 'base64').toString());

    if (uploadedFiles?.length > 0) {
      parsedData.file = uploadedFiles[0].path;
    }

    const updated = await this.reviewService.update(id, parsedData);

    return {
      message: 'Review entry updated successfully!',
      statusCode: 200,
      data: updated,
    };
  } catch (error) {
    return {
      message: 'Error updating Review entry',
      statusCode: 400,
      error: error.message,
    };
  }
}




}