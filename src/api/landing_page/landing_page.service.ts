import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
 
import { LandingPage, LandingPageSchema, LandingPageDocument } from '../../schema/schema';

@Injectable()
export class LandingPageService {
  constructor(@InjectModel(LandingPage.name) private landingPageModel: Model<LandingPageDocument>) { }

  async create1(journeyData: Partial<LandingPage>): Promise<LandingPage> {
    const createdlandingPage = new this.landingPageModel(journeyData);
    return createdlandingPage.save();
  }

  async findAll(page: number, pageSize: number, type?: string,) {
    const skip = (page - 1) * pageSize;  
    const limit = pageSize;  
  
    const filter: any = {};
    // Add type filter if provided
    if (type) {
      filter.type = type;
    }
  
    const result = await this.landingPageModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
  
    const totalCount = await this.landingPageModel.countDocuments(filter).exec();

    // Add image URLs to result
  const hostUrl = `http://localhost:3008`; // Base URL for image serving
  const resultWithUrls = result.map(product => {
    return {
      ...product.toObject(),
      imageUrl: product.file ? `${hostUrl}/${product.file.replace(/\\/g, '/')}` : null, // Append the URL
    };
  });
  
    return {
      message: 'Result successfully fetched!',
      statusCode: 201,
      resultWithUrls,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
    
  }
  
  
  async findOneById(id: string): Promise<any> { 
    try {
      const objectId = new Types.ObjectId(id);
  
      const result = await this.landingPageModel.findOne({ _id: objectId }).exec();
  
      if (!result) {
        throw new Error(`result not found with id: ${id}`);
      }
      console.log(result.file,"opopopopopopopoop")
      const hostUrl = `http://localhost:3008`;
      if (result.file) {
        // Format the file path to use forward slashes
        result['imageUrl'] = `${hostUrl}/${result.file.replace(/\\/g, '/')}`;
        console.log('Image URL:', result['imageUrl']);
      } else {
        result['imageUrl'] = null; // Handle cases where no file is present
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
  
  async updateJourney(id: any, resultUpdates: Partial<LandingPage>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id,"AAAAAAAAAAAAAAAAAAA",resultUpdates)
      const objectId = new Types.ObjectId(id);
      const updatedResult = await this.landingPageModel.updateOne(
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
    const deleteResult = await this.landingPageModel.deleteOne(
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