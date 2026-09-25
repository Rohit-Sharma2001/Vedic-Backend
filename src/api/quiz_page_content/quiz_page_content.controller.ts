// src/modules/quiz_page_content/quiz_page_content.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { QuizPageContentService } from './quiz_page_content.services';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { QuizPageContent } from 'src/schema/schema';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('quiz_page_content')
@UseInterceptors(Base64Interceptor)
export class QuizPageContentController {
  constructor(private readonly quizService: QuizPageContentService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData: Partial<QuizPageContent> = JSON.parse(decodedData);

      if (files?.file?.[0]) {
        parsedData.file = files.file[0].path;
      }

      const created = await this.quizService.create(parsedData);

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
      return await this.quizService.findOneById(parsed.id);
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
      const parsedData: Partial<QuizPageContent> = JSON.parse(decodedData);

      if (files?.file?.[0]) {
        parsedData.file = files.file[0].path;
      }

      return await this.quizService.update(id, parsedData);
    } catch (error) {
      return { message: 'Update failed', statusCode: 400, error: error.message };
    }
  }
}
