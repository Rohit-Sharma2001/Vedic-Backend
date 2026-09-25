import { Controller, Get, Post, Body, UploadedFile,UploadedFiles, Request, Put, Param, UseInterceptors, Query, Response } from '@nestjs/common';
import { LandingPageService } from './landing_page.service';
import { LandingPage } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express } from 'express';

@Controller('landing_page')
@UseInterceptors(Base64Interceptor)
export class LandingPageController {
  constructor(private readonly landingPageServices: LandingPageService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { video_file?: Express.Multer.File[],file?: Express.Multer.File[]},
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
      const result: Partial<LandingPage> = JSON.parse(decodedData);

      console.log('Decoded result:', result);

       

      if (files.video_file && files.video_file[0]) {
        result['video_file'] = files.video_file[0].path;
      }

      // Attach file paths to the result if uploaded
      if (files.file && files.file[0]) {
        result['file'] = files.file[0].path;
      }

      console.log(result,"aaaaaaaaaaaaaa")

      // Call the service to create the result
      const createdResult = await this.landingPageServices.create1(result);

      // Return a success message
      return {
        message: 'result successfully added!',
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
      const result: Partial<LandingPage> = JSON.parse(decodedData);
      console.log(result, "result");
   
      const page = result['page'] || 1;  
      const pageSize = result['pageSize'] || 10;  

      const type = result['type'];
  
       
      return this.landingPageServices.findAll(page, pageSize, type);
  
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
      const result: Partial<LandingPage> = JSON.parse(decodedData);
      const id = result['id'];

      console.log(`Fetching result with id: ${id}`);
 
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

     
      return this.landingPageServices.findOneById(id);

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
    @UploadedFiles() files: { file?: Express.Multer.File[]; },
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body); 
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing or undefined');
      }
 
      let decodedData;
      try {
        decodedData = Buffer.from(data, 'base64').toString('utf-8');
        console.log('Decoded Data String:', decodedData);
      } catch (decodeError) {
        throw new Error('Failed to decode base64 data');
      }

      let resultUpdates: Partial<LandingPage>;
      try {
        resultUpdates = JSON.parse(decodedData);
        console.log('Parsed journey Updates:', resultUpdates);
      } catch (parseError) {
        throw new Error('Invalid JSON in decoded data');
      }

      // Handle the uploaded file if exists
      if (files.file && files.file[0]) {
        resultUpdates['file'] = files.file[0].path;
      }

      // Call the service to update the journey
      const updatedJourney = await this.landingPageServices.updateJourney(id, resultUpdates);

      return {
        message: 'journey successfully updated!',
        statusCode: 200,
        data: updatedJourney,
      };
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
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<LandingPage> = JSON.parse(decodedData);
      const id = result['id'];

      console.log(`Deleting result with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Call the service to delete the result
      return this.landingPageServices.deleteResult(id);

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