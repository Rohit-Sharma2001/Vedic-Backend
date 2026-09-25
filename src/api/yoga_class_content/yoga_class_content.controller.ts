import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query, Response } from '@nestjs/common';
import { YogaClassesPageContent } from '../../schema/schema';
import { YogaClassesPageContentService } from './yoga_class_content.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express } from 'express';

@Controller('yoga_classes_content')
@UseInterceptors(Base64Interceptor)
export class YogaClassesPageContentController {
  constructor(private readonly yogaClassesPageContentServices: YogaClassesPageContentService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<YogaClassesPageContent> = JSON.parse(decodedData);

      console.log('Decoded result:', result);

      if (files.image && files.image[0]) {
        result['image'] = files.image[0].path;
      }

      // Set default timestamps
      result.date = new Date();
      result.modified = new Date();

      console.log(result, "Final Result to Save");

      // Call the service to create the result
      const createdResult = await this.yogaClassesPageContentServices.create1(result);

      // Return a success message
      return {
        message: 'Article successfully added!',
        statusCode: 201,
        data: createdResult
      };
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }
  }


  @Post('getAll')
  async findAll(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<YogaClassesPageContent> = JSON.parse(decodedData);
      console.log(result, "result");

      const page = result['page'] || 1;
      const pageSize = result['pageSize'] || 10;


      return this.yogaClassesPageContentServices.findAll(page, pageSize);

    } catch (error) {
      console.error('Error fetching results:', error);

      return {
        message: 'An error occurred while fetching the journeys',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('view')
  async findOne(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<YogaClassesPageContent> = JSON.parse(decodedData);
      const id = result.id;

      console.log(`Fetching result with id: ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      return await this.yogaClassesPageContentServices.findOneById(id);
    } catch (error) {
      console.error('Error fetching result:', error);
      return {
        message: 'An error occurred while fetching the result',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) throw new Error('Encrypted data is missing or undefined');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const resultUpdates: Partial<YogaClassesPageContent> = JSON.parse(decodedData);


      if (files.image && files.image[0]) {
        resultUpdates['image'] = files.image[0].path;
      }

      return await this.yogaClassesPageContentServices.updateYogaClassesPageContent(id, resultUpdates);
    } catch (error) {
      console.error('Error updating journey:', error.message);
      return {
        message: 'Error updating journey',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('delete')
  async deleteProduct(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<YogaClassesPageContent> = JSON.parse(decodedData);
      const id = result.id;

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      return await this.yogaClassesPageContentServices.deleteResult(id);
    } catch (error) {
      console.error('Error deleting result:', error);
      return {
        message: 'An error occurred while deleting the result',
        statusCode: 500,
        error: error.message,
      };
    }
  }







}