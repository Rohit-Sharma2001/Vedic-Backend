import { Controller, Get, Post, Body, UploadedFiles, Request, Put, Param, UseInterceptors, Query } from '@nestjs/common';
import { ContentService } from './content.service';
import { Content } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('Content')
@UseInterceptors(Base64Interceptor)
export class ContentController {
  constructor(private readonly contentServices: ContentService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
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
      const content: Partial<Content> = JSON.parse(decodedData);

      console.log('Decoded content:', content);



      if (files.file && files.file[0]) {
        content['file'] = files.file[0].path;
      }

      console.log(content, "aaaaaaaaaaaaaa")

      // Call the service to create the content
      const createdContent = await this.contentServices.create1(content);

      // Return a success message
      return {
        message: 'Content successfully added!',
        statusCode: 201,
        data: createdContent
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
  async findOne() {
    try {

      const id = '674834fc5b2cc04e91d2e442';

      console.log(`Fetching content with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Fetch the coupon by id
      return this.contentServices.findOneById(id);

    } catch (error) {
      console.error('Error fetching coupon:', error);
      return {
        message: 'An error occurred while fetching the coupon',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { quote_image?: Express.Multer.File[], career_image?: Express.Multer.File[], file?: Express.Multer.File[]; },
    @Body('data') data: string
  ) {
    try {
      console.log("Raw Request Body:", req.body);
      console.log("Extracted Data:", data);
  
      if (!data) throw new Error("Encrypted data is missing or undefined");
  
      let decodedData;
      try {
        decodedData = Buffer.from(data, 'base64').toString('utf-8');
        console.log("Decoded Data:", decodedData);
      } catch {
        throw new Error("Failed to decode Base64 data");
      }
  
      let contentUpdates: Partial<Content>;
      try {
        contentUpdates = JSON.parse(decodedData);
      } catch {
        throw new Error("Invalid JSON in decoded data");
      }
  
      // Ensure career is properly parsed
      if (typeof contentUpdates.career === "string") {
        try {
          contentUpdates.career = JSON.parse(contentUpdates.career);
        } catch {
          throw new Error("Failed to parse career field");
        }
      }
  
     
      if (files.file && files.file[0]) contentUpdates.file = files.file[0].path;
      if (files.quote_image && files.quote_image[0]) contentUpdates.quote_image = files.quote_image[0].path;
      if (files.career_image && files.career_image[0]) contentUpdates.career_image = files.career_image[0].path; // Ensure this is correctly handled
  
      const updatedContent = await this.contentServices.updateContent(id, contentUpdates);
  
      return { message: "Product successfully updated!", statusCode: 200, data: updatedContent };
    } catch (error) {
      console.error("Error updating product:", error.message);
      return { message: "Error updating product", statusCode: 400, error: error.message };
    }
  }
  



  @Post('addOne')
  async createOne(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      console.log('Request Body addOne:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data


      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const content: Partial<Content> = JSON.parse(decodedData);

      console.log('Decoded content:', content);



      if (files.file && files.file[0]) {
        content['file'] = files.file[0].path;
      }

      console.log(content, "aaaaaaaaaaaaaa")

      // Call the service to create the content
      const createdContent = await this.contentServices.create1(content);

      // Return a success message
      return {
        message: 'Content successfully added!',
        statusCode: 201,
        data: createdContent
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


  @Post('viewOne')
  async findTwo() {
    try {

      console.log("asasasasasassssasassasasaassaas")

      const id = '67495001f782a33be496bae1';

      console.log(`Fetching content with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Fetch the coupon by id
      return this.contentServices.findOneById(id);

    } catch (error) {
      console.error('Error fetching coupon:', error);
      return {
        message: 'An error occurred while fetching the coupon',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('viewAyurveda')
  async findThree() {
    try {

      console.log("Ayurveda")

      const id = '67495c60325ea5c184752947';

      console.log(`Fetching content with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Fetch the coupon by id
      return this.contentServices.findOneById(id);

    } catch (error) {
      console.error('Error fetching coupon:', error);
      return {
        message: 'An error occurred while fetching the coupon',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('viewDonation')
  async findFour() {
    try {

      console.log("Donation")

      const id = '67495d0c325ea5c184752949';

      console.log(`Fetching content with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Fetch the coupon by id
      return this.contentServices.findOneById(id);

    } catch (error) {
      console.error('Error fetching coupon:', error);
      return {
        message: 'An error occurred while fetching the coupon',
        statusCode: 500,
        error: error.message,
      };
    }
  }









}