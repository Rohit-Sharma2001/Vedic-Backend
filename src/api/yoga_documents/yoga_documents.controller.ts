// src/modules/yoga_documents/yoga_documents.controller.ts
import {
  Controller,
  Post,
  Body,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { YogaDocumentsService } from './yoga_documents.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('yoga_documents')
@UseInterceptors(Base64Interceptor)
export class YogaDocumentsController {
  constructor(private readonly yogaDocumentsService: YogaDocumentsService) {}

  @Post('add')
  async addDocument(
    @Request() req: Request,
    @UploadedFiles() files: { document?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const docData = JSON.parse(decoded);

      if (files.document && files.document[0]) {
        docData.file = files.document[0].path;
      } else {
        throw new Error('Document file is required');
      }

      return await this.yogaDocumentsService.addDocument(docData);
      
    } catch (error) {
      console.error('Error adding document:', error);
      return {
        message: 'Invalid data or upload error',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('delete')
  async deleteDocument(@Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      const { _id } = parsed;

      if (!_id) {
        return { message: 'Document _id is required', statusCode: 400 };
      }

      return await this.yogaDocumentsService.deleteDocument(_id);
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        message: 'Invalid data or server error',
        statusCode: 500,
        error: error.message,
      };
    }
  }
}
