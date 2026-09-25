import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;

import { MainBanner, MainBannerDocument } from '../../schema/schema';

@Injectable()
export class MainBannerService {
  constructor(@InjectModel(MainBanner.name) private mainBannerModel: Model<MainBannerDocument>) {}

  async create(userData: Partial<MainBanner>): Promise<MainBanner> {
    const createdMainBanner = new this.mainBannerModel(userData);
    return createdMainBanner.save();
  }

//   async findAll(type?: string): Promise<MainBanner[]> {
//     const filter = type ? { type } : {};
//     return this.mainBannerModel.find(filter).exec();
// }

async findAll(page: number, pageSize: number, type?: string,) {
  const skip = (page - 1) * pageSize;  
  const limit = pageSize;  

  const filter: any = {};
  // Add type filter if provided
  if (type) {
    filter.type = type;
  }

  const result = await this.mainBannerModel
    .find(filter)
    .skip(skip)
    .limit(limit)
    .exec();

  const totalCount = await this.mainBannerModel.countDocuments(filter).exec();

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

  async updateMainBanner(id: any, mainBannerUpdates: Partial<MainBanner>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id,"AAAAAAAAAAAAAAAAAAA",mainBannerUpdates)
      const objectId = new Types.ObjectId(id);
      const updatedProduct = await this.mainBannerModel.updateOne(
        {_id:objectId},
        { $set: mainBannerUpdates }, // Use `$set` to update specific fields
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

  async findOneById(id: string): Promise<any> { 
    try {
      const objectId = new Types.ObjectId(id);
  
      const Banner = await this.mainBannerModel.findOne({ _id: objectId }).exec();
  
      if (!Banner) {
        throw new Error(`Banner not found with id: ${id}`);
      }
      console.log(Banner.file,"opopopopopopopoop")
      const hostUrl = `http://localhost:3008`;
      if (Banner.file) {
        // Format the file path to use forward slashes
        Banner['imageUrl'] = `${hostUrl}/${Banner.file.replace(/\\/g, '/')}`;
        console.log('Image URL:', Banner['imageUrl']);
      } else {
        Banner['imageUrl'] = null; // Handle cases where no file is present
      }
  
      return {
        message: 'Product successfully fetched!',
        statusCode: 201,
        Banner,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
  
      return {
        message: 'An error occurred while fetching the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  async deleteMainBannerData(id: any) {
    // The update query
    console.log(id, "uiui")
    const deletedData = await this.mainBannerModel.deleteOne(
      { _id: new ObjectId(id) },
      // data, // Return the updated document
    );
    console.log(deletedData, "deletedData")
    return {
      message: 'File deleted successfully',
      // filePath: file.path,
    };
  }


}