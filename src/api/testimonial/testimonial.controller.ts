import { Controller, Get, Post, Body, UploadedFile, Request, Put, Param, UseInterceptors, Query } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { Testimonial } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('Testimonial')
@UseInterceptors(Base64Interceptor)
export class TestimonialController {
  constructor(private readonly testimonialServices: TestimonialService) { }

  @Post('add')
  async create(
    @Request() req: Request,
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
      const testimonial: Partial<Testimonial> = JSON.parse(decodedData);

      console.log('Decoded testimonial:', testimonial);

      // Call the service to create the testimonial
      const createdtestimonial = await this.testimonialServices.create1(testimonial);

      // Return a success message
      return {
        message: 'Testimonial successfully added!',
        statusCode: 201,
        data: createdtestimonial
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

  @Post('allTestimonial')
  async findAll(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const testimonial: Partial<Testimonial> = JSON.parse(decodedData);
      console.log(testimonial, "testimonial");
  
      // Extract pagination parameters
      const page = testimonial['page'] || 1; // Default to page 1
      const pageSize = testimonial['pageSize'] || 10; // Default to 10 items per page
  
      const title = testimonial['title'];
  
       
  
      // Fetch all coupons with pagination and filtering
      return this.testimonialServices.findAll(page, pageSize, title);
    } catch (error) {
      console.error('Error fetching coupons:', error);
  
      // Return an error response
      return {
        message: 'An error occurred while fetching the coupons',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  

  @Post('view')
  async findOne(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const testimonial: Partial<Testimonial> = JSON.parse(decodedData);
      const id = testimonial['id'];

      console.log(`Fetching testimonial with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Fetch the testimonial by id
      return this.testimonialServices.findOneById(id);

    } catch (error) {
      console.error('Error fetching testimonial:', error);
      return {
        message: 'An error occurred while fetching the testimonial',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('update')
  async update(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode and parse the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const testimonialUpdates: Partial<Testimonial> = JSON.parse(decodedData);

      console.log('Decoded Updates:', testimonialUpdates);

      let id = testimonialUpdates['_id']

      // Call the service to update the product
      const updatedTestimonial = await this.testimonialServices.updateTestimonial(id, testimonialUpdates);

      // Return the success response
      return {
        message: 'Testimonial successfully updated!',
        statusCode: 200,
        data: updatedTestimonial,
      };

    } catch (error) {
      console.error('Error updating product:', error);
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
      const testimonial: Partial<Testimonial> = JSON.parse(decodedData);
      const id = testimonial['id'];

      console.log(`Deleting testimonial with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Call the service to delete the testimonial
      return this.testimonialServices.deleteTestimonial(id);

    } catch (error) {
      console.error('Error deleting testimonial:', error);
      return {
        message: 'An error occurred while deleting the testimonial',
        statusCode: 500,
        error: error.message,
      };
    }
  }






}