import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import axios from 'axios';
let { ObjectId } = require('mongoose').Types;

import { CenterManagement, CenterManagementSchema, CenterManagementDocument } from '../../schema/schema';

@Injectable()
export class CenterManagementService {
  constructor(@InjectModel(CenterManagement.name) private centerManagementModel: Model<CenterManagementDocument>) { }

  async create1(centerManagementData: Partial<CenterManagement>): Promise<any> {

    const validated = await axios.post('https://api.goshippo.com/addresses/', {
      name: centerManagementData.centerName,
      street1: centerManagementData.address,
      city: centerManagementData['city'],
      state: centerManagementData['state'],
      zip: centerManagementData['pincode'],
      country: centerManagementData['country'],
      phone: centerManagementData['phone_number'],
      longitude: centerManagementData.longitude,
      latitude: centerManagementData.latitude,
      email: centerManagementData.email,
      validate: true,
      is_residential: false
    }, {
      headers: {
        Authorization: `${process.env.SHIPPOKEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (validated.data.validation_results.is_valid) {
    const createdCenterManagement = new this.centerManagementModel({...centerManagementData,shippoAddressId:validated.data.object_id});
    return createdCenterManagement.save();
    }else {
      throw new Error(`Please enter a valid address. Shippo cann't pickup from this address`);
    }
  }

  async findAll(page: number, pageSize: number, centerName?: string, allData?: string) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const filter: any = {};
    let CenterManagement

    if (centerName) {
      filter.centerName = { $regex: new RegExp(centerName, 'i') }; // Case-insensitive search
    }
    if (allData) {
      console.log("Fetching all data without pagination");
      CenterManagement = await this.centerManagementModel.find(filter).exec();
    } else {
      console.log("Fetching all data with pagination");
      CenterManagement = await this.centerManagementModel.find(filter).skip(skip).limit(limit).exec();
    }

    const totalCount = await this.centerManagementModel.countDocuments(filter).exec();

    // Add image URLs to CenterManagement
    const hostUrl = `http://localhost:3008`; // Base URL for image serving
    const CenterManagementWithUrls = CenterManagement.map(product => {
      return {
        ...product.toObject(),
        imageUrl: product.file ? `${hostUrl}/${product.file.replace(/\\/g, '/')}` : null, // Append the URL
      };
    });

    return {
      message: 'Center Management successfully fetched!',
      statusCode: 201,
      centers: CenterManagementWithUrls, // Renamed to 'centers' for clarity
      totalCount,
      page: allData ? null : page, // If `allData` is true, page info is irrelevant
      pageSize: allData ? null : pageSize,
      totalPages: allData ? null : Math.ceil(totalCount / pageSize),
    };
  }


  async findOneById(id: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(id);

      const centerManagementData = await this.centerManagementModel.findOne({ _id: objectId }).exec();

      if (!centerManagementData) {
        throw new Error(`centerManagementData not found with id: ${id}`);
      }
      console.log(centerManagementData.file, "opopopopopopopoop")
      const hostUrl = `http://localhost:3008`;
      if (centerManagementData.file) {
        // Format the file path to use forward slashes
        centerManagementData['imageUrl'] = `${hostUrl}/${centerManagementData.file.replace(/\\/g, '/')}`;
        console.log('Image URL:', centerManagementData['imageUrl']);
      } else {
        centerManagementData['imageUrl'] = null; // Handle cases where no file is present
      }

      return {
        message: 'centerManagementData successfully fetched!',
        statusCode: 201,
        centerManagementData,
      };
    } catch (error) {
      console.error('Error fetching centerManagementData:', error);

      return {
        message: 'An error occurred while fetching the centerManagementData',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async updateProduct(id: any, centerManagement: Partial<CenterManagement>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id, "AAAAAAAAAAAAAAAAAAA", centerManagement)
      const objectId = new Types.ObjectId(id);
      const updatedCenterManagement = await this.centerManagementModel.updateOne(
        { _id: objectId },
        { $set: centerManagement }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the updated document and validate schema
      );

      if (!updatedCenterManagement) {
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
        updatedCenterManagement,
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


  async deleteCenterManagement(id: any) {
    // The update query
    console.log(id, "uiui")
    const deletedData = await this.centerManagementModel.deleteOne(
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