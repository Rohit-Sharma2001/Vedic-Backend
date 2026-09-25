import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
 
import { Content, ContentSchema, ContentDocument } from '../../schema/schema';

@Injectable()
export class ContentService {
  constructor(@InjectModel(Content.name) private contentModel: Model<ContentDocument>) { }

  async create1(contentData: Partial<Content>): Promise<Content> {
    const createdContent = new this.contentModel(contentData);
    // console.log(createdContent,"createdContentcreatedContent",Product)
    return createdContent.save();
  }
  

  async findOneById(id: string): Promise<any> {  // Return type is updated to 'any' for more flexible response
    try {
      // Convert the ID to ObjectId (assuming it's already validated in the controller)
      const objectId = new Types.ObjectId(id);
  
      // Find the product by ObjectId
      const coupon = await this.contentModel.findOne({ _id: objectId }).exec();
  
      if (!coupon) {
        throw new Error(`coupon not found with id: ${id}`);
      }
  
      // Return the coupon along with a success message
      return {
        message: 'coupon successfully fetched!',
        statusCode: 201,
        coupon,
      };
    } catch (error) {
      console.error('Error fetching coupon:', error);
  
      // Return an error response if the coupon is not found or there is any other error
      return {
        message: 'An error occurred while fetching the coupon',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  
  async updateContent(id: any, contentUpdates: Partial<Content>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id,"AAAAAAAAAAAAAAAAAAA",contentUpdates)
      const objectId = new Types.ObjectId(id);
      contentUpdates.modified = new Date();
      const updatedProduct = await this.contentModel.updateOne(
        {_id:objectId},
        { $set: contentUpdates }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the updated document and validate schema
      );
  
      if (!updatedProduct) {
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
        updatedProduct,
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
  



}