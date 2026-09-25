import { Controller, Get, Post, Body, UploadedFile,UploadedFiles, Request, Put, Param, UseInterceptors, Query, Response } from '@nestjs/common';
import { ContactManagementService } from './contact_management.service';
import { ContactManagement } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('contact_management')
@UseInterceptors(Base64Interceptor)
export class ContactManagementController {
  constructor(private readonly contactManagementService: ContactManagementService) { }

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
      const contactManagement: Partial<ContactManagement> = JSON.parse(decodedData);

      console.log('Decoded ContactManagement:', contactManagement);

       

      if (files.file && files.file[0]) {
        contactManagement['file'] = files.file[0].path;
      }

      console.log(contactManagement,"aaaaaaaaaaaaaa")

      // Call the service to create the CenterManagement
      const createdContactManagement = await this.contactManagementService.create(contactManagement);

      // Return a success message
      return {
        message: 'ContactManagement successfully added!',
        statusCode: 201,
        data: createdContactManagement
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

  @Post('view')
  async findOne(@Body('data') data: any) {
    try {
      
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const contactName: Partial<ContactManagement> = JSON.parse(decodedData);
      const id = contactName['id'];

      console.log(`Fetching Contact with id: ${id}`);
 
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

     
      return this.contactManagementService.findOneById(id);

    } catch (error) {
      console.error('Error fetching contact:', error);
      return {
        message: 'An error occurred while fetching the contact',
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
      let contactManagement: Partial<ContactManagement>;
      try {
        contactManagement = JSON.parse(decodedData);
        console.log('Parsed Contact Updates:', contactManagement);
      } catch (parseError) {
        throw new Error('Invalid JSON in decoded data');
      }
      // Handle the uploaded file if exists
      if (files.file && files.file[0]) {
        contactManagement['file'] = files.file[0].path;
      }
      // Call the service to update the product
      const updatedContact = await this.contactManagementService.update(id, contactManagement);
      return {
        message: 'contact successfully updated!',
        statusCode: 200,
        data: updatedContact,
      };
    } catch (error) {
      console.error('Error updating contact:', error.message);
      return {
        message: 'Error updating contact',
        statusCode: 400,
        error: error.message,
      };
    }
  }

}