import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
 
import { Article, ArticleSchema, ArticleDocument } from '../../schema/schema';

@Injectable()
export class ArticleService {
  constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) { }

  async create1(journeyData: Partial<Article>): Promise<Article> {
    const createdArticle = new this.articleModel(journeyData);
    return createdArticle.save();
  }

  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;  
    const limit = pageSize;  
  
    const filter: any = {};
    
  
    const result = await this.articleModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
  
    const totalCount = await this.articleModel.countDocuments(filter).exec();

    // Add image URLs to result
  const hostUrl = `http://localhost:3008`; // Base URL for image serving
 
  
    return {
      message: 'Result successfully fetched!',
      statusCode: 201,
      result,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
    
  }
  
  
  async findOneById(id: string): Promise<any> { 
    try {
      const objectId = new Types.ObjectId(id);
  
      const result = await this.articleModel.findOne({ _id: objectId }).exec();
  
      if (!result) {
        throw new Error(`result not found with id: ${id}`);
      }
  
      return {
        message: 'journey successfully fetched!',
        statusCode: 201,
        result,
      };
    } catch (error) {
      console.error('Error fetching journey:', error);
  
      return {
        message: 'An error occurred while fetching the journey',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  
  async updateJourney(id: any, resultUpdates: Partial<Article>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id,"AAAAAAAAAAAAAAAAAAA",resultUpdates)
      const objectId = new Types.ObjectId(id);
      const updatedResult = await this.articleModel.updateOne(
        {_id:objectId},
        { $set: resultUpdates }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the journey document and validate schema
      );
  
      if (!updatedResult) {
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
        updatedResult,
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
  

  async deleteResult(id: any) {
    // The update query
    console.log(id,"uiui")
    const deleteResult = await this.articleModel.deleteOne(
      { _id: new ObjectId(id) },
      // data, // Return the updated document
    );
    console.log(deleteResult,"deleteResult")
    return {
      message: 'File deleted successfully',
      // filePath: file.path,
      };
  }


  
}