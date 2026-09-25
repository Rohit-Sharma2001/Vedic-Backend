// src/modules/job_page_content/job_page_content.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { JobPageContentService } from './job_page_content.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JobPageContent } from 'src/schema/schema';
@Controller('job_page_content')
@UseInterceptors(Base64Interceptor)
export class JobPageContentController {
  constructor(private readonly jobService: JobPageContentService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<JobPageContent> = JSON.parse(decodedData);

      if (files?.file?.[0]) {
        parsedData.file = files.file[0].path;
      }

      const created = await this.jobService.create(parsedData);

      return { message: 'Entry created successfully!', statusCode: 201, data: created };
    } catch (error) {
      return { message: 'Creation failed', statusCode: 400, error: error.message };
    }
  }

  @Post('view')
  async view(@Body('data') data: string) {
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      return await this.jobService.findOneById(parsed.id);
    } catch (error) {
      return { message: 'Fetch failed', statusCode: 500, error: error.message };
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
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<JobPageContent> = JSON.parse(decodedData);

      if (files?.file?.[0]) {
        parsedData.file = files.file[0].path;
      }

      return await this.jobService.update(id, parsedData);
    } catch (error) {
      return { message: 'Update failed', statusCode: 400, error: error.message };
    }
  }
}
