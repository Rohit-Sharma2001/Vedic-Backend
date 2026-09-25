import { Controller, Get, Post, Body,UploadedFile,Request, UseInterceptors, UploadedFiles, Param } from '@nestjs/common';
import { MainBannerService } from './main_banner.service';
import { MainBanner } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Model,Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;

@Controller('main_banner')
@UseInterceptors(Base64Interceptor)
export class MainBannerController {
  constructor(private readonly mainBannerService: MainBannerService) {}

  // @Post()
  // async create(@Body() mainBanner: Partial<MainBanner>) {
  //   return this.mainBannerService.create(mainBanner);
  // }

   @Post('add')
    async create(
      @Request() req: Request,
      @UploadedFiles() files: { file?: Express.Multer.File[]},
      @Body('data') data: string
    ) {
      try {
        console.log('Request Body:', req.body);  // Log the request body
        console.log('Encrypted Data Received:', data);  // Log the encrypted data
  
        if (!data) {
          throw new Error('Encrypted data is missing');
        }
  
        // Decode base64 encoded data
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        const mainBanner: Partial<MainBanner> = JSON.parse(decodedData);
  
        console.log('Decoded mainBanner:', mainBanner);

        if (files.file && files.file[0]) {
          mainBanner['file'] = files.file[0].path;
        }
  
        console.log(mainBanner,"aaaaaaaaaaaaaa")
  
        // Call the service to create the mainBanner
        const createdmainBanner = await this.mainBannerService.create(mainBanner);
  
        // Return a success message
        return {
          message: 'mainBanner successfully added!',
          statusCode: 201,
          data: createdmainBanner
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


    // @Get('get')
    // async findAll(@Body('type') type: string) {
    //     return this.mainBannerService.findAll(type);
    // }

    @Post('get')
  async findAll(@Body('data') data: any) {
    try {
    
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<MainBanner> = JSON.parse(decodedData);
      console.log(result, "result");
   
      const page = result['page'] || 1;  
      const pageSize = result['pageSize'] || 10;  

      const type = result['type'];
  
       
      return this.mainBannerService.findAll(page, pageSize, type);
  
    } catch (error) {
      console.error('Error fetching results:', error);
   
      return {
        message: 'An error occurred while fetching the journeys',
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

      let mainBannerUpdates: Partial<MainBanner>;
      try {
        mainBannerUpdates = JSON.parse(decodedData);
        console.log('Parsed Product Updates:', mainBannerUpdates);
      } catch (parseError) {
        throw new Error('Invalid JSON in decoded data');
      }

      // Handle the uploaded file if exists
      if (files.file && files.file[0]) {
        mainBannerUpdates['file'] = files.file[0].path;
      }

      // Call the service to update the product
      const updatedMainBanner = await this.mainBannerService.updateMainBanner(id, mainBannerUpdates);

      return {
        message: 'Main Banner successfully updated!',
        statusCode: 200,
        data: updatedMainBanner,
      };
    } catch (error) {
      console.error('Error updating MainBanner:', error.message);
      return {
        message: 'Error updating MainBanner',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('getBanner')
  async findOne(@Body('data') data: any) {
    try {
      
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const product: Partial<MainBanner> = JSON.parse(decodedData);
      const id = product['id'];

      console.log(`Fetching product with id: ${id}`);
 
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

     
      return this.mainBannerService.findOneById(id);

    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        message: 'An error occurred while fetching the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  
  @Post('delete')
  async deleteProduct(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const blogManagement: Partial<MainBanner> = JSON.parse(decodedData);
      const id = blogManagement['id'];

      console.log(`Deleting blogManagement with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Call the service to delete the centerManagement
      return this.mainBannerService.deleteMainBannerData(id);

    } catch (error) {
      console.error('Error deleting blogManagement:', error);
      return {
        message: 'An error occurred while deleting the blogManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  
}