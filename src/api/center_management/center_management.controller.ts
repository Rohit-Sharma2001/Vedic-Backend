import { Controller, Get, Post, Body, UploadedFile,UploadedFiles, Request, Put, Param, UseInterceptors, Query, Response } from '@nestjs/common';
import { CenterManagementService } from './center_management.service';
import { CenterManagement } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express } from 'express';

@Controller('center_management')
@UseInterceptors(Base64Interceptor)
export class CenterManagementController {
  constructor(private readonly centerManagementService: CenterManagementService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[]},
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
      const centerManagement: Partial<CenterManagement> = JSON.parse(decodedData);

      console.log('Decoded centerManagement:', centerManagement);

       

      if (files.file && files.file[0]) {
        centerManagement['file'] = files.file[0].path;
      }

      console.log(centerManagement,"aaaaaaaaaaaaaa")

      // Call the service to create the CenterManagement
      const createdCenterManagement = await this.centerManagementService.create1(centerManagement);

      // Return a success message
      return {
        message: 'CenterManagement successfully added!',
        statusCode: 201,
        data: createdCenterManagement
      };
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: error,
        statusCode: 400,
        error: error.message
      };
    }
  }

  @Post('allCenterManagement')
  async findAll(@Body('data') data: any) {
    try {
    
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const CenterManagement: Partial<CenterManagement> = JSON.parse(decodedData);
      console.log(CenterManagement, "CenterManagement");
   
      const page = CenterManagement['page'] || 1;  
      const pageSize = CenterManagement['pageSize'] || 10;  
  
       
      const centerName = CenterManagement['centerName'] ;  
      const allData = CenterManagement['all'] || "" ;  
  
 
      return this.centerManagementService.findAll(page, pageSize, centerName, allData);
  
    } catch (error) {
      console.error('Error fetching centerManagement:', error);
   
      return {
        message: 'An error occurred while fetching the centerManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  



  @Post('view')
  async findOne(@Body('data') data: any) {
    try {
      
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const centerName: Partial<CenterManagement> = JSON.parse(decodedData);
      const id = centerName['id'];

      console.log(`Fetching centerName with id: ${id}`);
 
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

     
      return this.centerManagementService.findOneById(id);

    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        message: 'An error occurred while fetching the product',
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

      let centerManagement: Partial<CenterManagement>;
      try {
        centerManagement = JSON.parse(decodedData);
        console.log('Parsed Product Updates:', centerManagement);
      } catch (parseError) {
        throw new Error('Invalid JSON in decoded data');
      }

      // Handle the uploaded file if exists
      if (files.file && files.file[0]) {
        centerManagement['file'] = files.file[0].path;
      }
      // Call the service to update the product
      const updatedProduct = await this.centerManagementService.updateProduct(id, centerManagement);

      return {
        message: 'Product successfully updated!',
        statusCode: 200,
        data: updatedProduct,
      };
    } catch (error) {
      console.error('Error updating product:', error.message);
      return {
        message: 'Error updating product',
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
      const centerManagement: Partial<CenterManagement> = JSON.parse(decodedData);
      const id = centerManagement['id'];

      console.log(`Deleting centerManagement with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Call the service to delete the centerManagement
      return this.centerManagementService.deleteCenterManagement(id);

    } catch (error) {
      console.error('Error deleting centerManagement:', error);
      return {
        message: 'An error occurred while deleting the centerManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }






}