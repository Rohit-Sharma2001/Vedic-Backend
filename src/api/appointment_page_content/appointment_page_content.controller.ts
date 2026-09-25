// src/modules/appointment_page_content/appointment_page_content.controller.ts
import {
  Controller,
  Post,
  Param,
  Request,
  Body,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppointmentPageContentService } from './appointment_page_content.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AppointmentPageContent } from 'src/schema/schema';

@Controller('appointment_page_content')
@UseInterceptors(Base64Interceptor)
export class AppointmentPageContentController {
  constructor(private readonly appointmentService: AppointmentPageContentService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parsed: Partial<AppointmentPageContent> = JSON.parse(decoded);
      if (files?.file?.[0]) parsed.file = files.file[0].path;
      const created = await this.appointmentService.create(parsed);
      return { message: 'Created successfully', statusCode: 201, data: created };
    } catch (err) {
      return { message: 'Creation failed', statusCode: 400, error: err.message };
    }
  }

  @Post('view')
  async view(@Body('data') data: string) {
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      return await this.appointmentService.findOneById(parsed.id);
    } catch (err) {
      return { message: 'View failed', statusCode: 500, error: err.message };
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
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parsed: Partial<AppointmentPageContent> = JSON.parse(decoded);
      if (files?.file?.[0]) parsed.file = files.file[0].path;
      return await this.appointmentService.update(id, parsed);
    } catch (err) {
      return { message: 'Update failed', statusCode: 400, error: err.message };
    }
  }
}
