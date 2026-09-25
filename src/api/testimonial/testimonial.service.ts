import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
 
import { Testimonial, TestimonialSchema, TestimonialDocument } from '../../schema/schema';

@Injectable()
export class TestimonialService {
  constructor(@InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>) { }

  async create1(testimonialData: Partial<Testimonial>): Promise<Testimonial> {
    const createdTestimonial = new this.testimonialModel(testimonialData);
    // console.log(createdTestimonial,"createdTestimonialcreatedTestimonial",Product)
    return createdTestimonial.save();
  }

  async findAll(
    page: number,
    pageSize: number,
    title?: string,
    
  ) {
    const skip = (page - 1) * pageSize; // Calculate how many documents to skip
    const limit = pageSize;
  
    // Build the filter query
    const filter: any = {};
  
    if (title) {
      filter.title = title;
    }
  
    
    // Fetch coupons with pagination and filtering
    const testimonial = await this.testimonialModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
  
    // Get the total count of filtered testimonial (for pagination metadata)
    const totalCount = await this.testimonialModel.countDocuments(filter).exec();
  
    // Return the testimonial and pagination metadata
    return {
      message: 'Testimonial successfully fetched!',
      statusCode: 200,
      testimonial,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }
  

  async findOneById(id: string): Promise<any> {  // Return type is updated to 'any' for more flexible response
    try {
      // Convert the ID to ObjectId (assuming it's already validated in the controller)
      const objectId = new Types.ObjectId(id);
  
      // Find the product by ObjectId
      const testimonial = await this.testimonialModel.findOne({ _id: objectId }).exec();
  
      if (!testimonial) {
        throw new Error(`testimonial not found with id: ${id}`);
      }
  
      // Return the testimonial along with a success message
      return {
        message: 'testimonial successfully fetched!',
        statusCode: 201,
        testimonial,
      };
    } catch (error) {
      console.error('Error fetching testimonial:', error);
  
      // Return an error response if the testimonial is not found or there is any other error
      return {
        message: 'An error occurred while fetching the testimonial',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  
  async updateTestimonial(id: any, testimonialUpdates: Partial<Testimonial>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id,"AAAAAAAAAAAAAAAAAAA",testimonialUpdates)
      const objectId = new Types.ObjectId(id);
      testimonialUpdates.modified = new Date();
      const updatedTestimonial = await this.testimonialModel.updateOne(
        {_id:objectId},
        { $set: testimonialUpdates }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the updated document and validate schema
      );
  
      if (!updatedTestimonial) {
        return {
          message: 'Product not found with the provided id',
          statusCode: 404,
          error: `No product found with id: ${id}`,
        };
      }
  
      // Return success message with updated product
      return {
        message: 'Product successfully updated!',
        statusCode: 201,
        updatedTestimonial,
      };
    } catch (error) {
      console.error('Error updating product in the database:', error);
  
      // Return error response
      return {
        message: 'An error occurred while updating the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  async deleteTestimonial(id: any) {
    // The update query
    console.log(id,"uiui")
    const updatedTestimonial = await this.testimonialModel.deleteOne(
      { _id: new ObjectId(id) },
      // data, // Return the updated document
    );
    console.log(updatedTestimonial,"updatedUser")
    return {
      message: 'File deleted successfully',
      // filePath: file.path,
      };
  }



}