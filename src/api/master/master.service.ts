import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;

import { Master, MasterSchema, MasterDocument, suscribe, suscribeDocument, Product, ProductDocument } from '../../schema/schema';

@Injectable()
export class MasterService {
  constructor(
    @InjectModel(Master.name) private masterModel: Model<MasterDocument>,
    @InjectModel(suscribe.name) private suscribeModel: Model<suscribeDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) { }

  async createCategory(masterData: Partial<Master>): Promise<Master> {
    const createdProduct = new this.masterModel(masterData);
    return createdProduct.save();
  }

  async addSuscribe(suscribeData: Partial<suscribe>): Promise<suscribe> {
    const createdSuscribe = new this.suscribeModel(suscribeData);
    return createdSuscribe.save();
  }


  async findAll(
    page: number,
    pageSize: number,
    dropdown_type?: string,
    category_id?: any,
    status?:any
  ) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;


    const filter: any = {};


    if (dropdown_type) {
      filter.dropdown_type = dropdown_type
    }
    if (category_id) {

      filter.category_id = new ObjectId(category_id);
    }
    if (status){
      filter.status=1
    }

    const aggregationPipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'masters',
          localField: 'category_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$categoryDetails.name', 0] }, // Add category name
        },
      },
      { $project: { categoryDetails: 0 } },
      { $sort: { order: 1 } },
      { $skip: skip },
      { $limit: limit },
    ];


    const result = await this.masterModel.aggregate(aggregationPipeline).exec();

    const totalCount = await this.masterModel.countDocuments(filter).exec();


    return {
      message: 'Data successfully fetched!',
      statusCode: 200,
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

      const data = await this.masterModel.findOne({ _id: objectId }).exec();
      if (!data) {
        throw new Error(`Data not found with id: ${id}`);
      }

      const responseData = data.toObject();

      if (data.category_id) {
        const catId = new Types.ObjectId(data.category_id);
        const catData = await this.masterModel.findOne({ _id: catId }).exec();
        if (catData && catData.name) {
          responseData['categoryName'] = catData.name;
        }
      }

      return {
        message: 'Data successfully fetched!',
        statusCode: 201,
        data: responseData,
      };
    } catch (error) {
      console.error('Error fetching data:', error);

      return {
        message: 'An error occurred while fetching the data',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  async updateCategory(id: string, updates: Partial<any>) {
    try {
      const updatedCategory = await this.masterModel.findByIdAndUpdate(
        id,
        {
          ...updates,
          modified: new Date(),
        },
        { new: true }
      );

      return updatedCategory;
    } catch (error) {
      console.error('Error updating category in service:', error);
      throw error;
    }
  }


  async deleteData(id: any) {
    // The update query
    console.log(id, "uiui")

    const masterData = await this.masterModel.findById(id);

    if (masterData.dropdown_type == 'category') {
      const categoryData = await this.masterModel.find({ category_id: masterData._id });
      if (categoryData.length > 0) {
        return {
          message: `${masterData.name} category has sub-category first delete sub-category`,
          statusCode: 204
        };
      }
    } else if (masterData.dropdown_type == 'sub_category' || masterData.dropdown_type == 'brand') {
      let filter = {}
      if (masterData.dropdown_type == 'sub_category') {
        filter['subCategory'] = masterData._id
      } else if (masterData.dropdown_type == 'brand') {
        filter['brand'] = masterData._id
      }
      const categoryData = await this.productModel.find(filter);
      if (categoryData.length > 0) {
        return {
          message: `${masterData.name} ${masterData.dropdown_type} has products first delete products`,
          statusCode: 204
        };
      }
    }
    const updatedUser = await this.masterModel.deleteOne(
      { _id: new ObjectId(id) }
    );
    // console.log(updatedUser, "updatedUser")
    return {
      message: 'File deleted successfully',
      statusCode: 200
      // filePath: file.path,
    };
  }

  async toggleStatus(id: string) {
    try {
      const record = await this.masterModel.findById(id);
      if (!record) {
        return {
          message: 'Record not found',
          statusCode: 404,
        };
      }

      const newStatus = record.status === 1 ? 0 : 1;

      const updated = await this.masterModel.findByIdAndUpdate(
        id,
        { status: newStatus, modified: new Date() },
        { new: true }
      );

      return {
        message: `Status successfully updated to ${newStatus === 1 ? 'Active' : 'Inactive'}`,
        statusCode: 200,
        data: updated,
      };
    } catch (error) {
      console.error('Error toggling status:', error);
      return {
        message: 'Failed to toggle status',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  // services/master.service.ts  ✅ ADD
  async deleteSuscriber(id: string) {
    try {
      const deleted = await this.suscribeModel.findByIdAndDelete(id);
      if (!deleted) {
        return { message: 'Subscriber not found', statusCode: 404 };
      }
      return { message: 'Subscriber deleted successfully', statusCode: 200 };
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      return { message: 'Failed to delete subscriber', statusCode: 500, error: error.message };
    }
  }


  async findSubcategory(category_id: any): Promise<any> {
    try {
      const objectId = new Types.ObjectId(category_id);

      const catData = await this.masterModel.find({ category_id: objectId }).exec();
      if (!catData) {
        throw new Error(`Data not found with id: ${category_id}`);
      }

      return {
        message: 'Data successfully fetched!',
        statusCode: 201,
        data: catData,
      };
    } catch (error) {
      console.error('Error fetching data:', error);

      return {
        message: 'An error occurred while fetching the data',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  // services/master.service.ts

  async getSubCategoryBasedOnCategory(category_ids: string[]): Promise<any> {
    try {
      const objectIdArray = category_ids
        .filter(id => Types.ObjectId.isValid(id))
        .map(id => new Types.ObjectId(id));

      if (objectIdArray.length === 0) {
        return {
          message: 'No valid category IDs provided',
          statusCode: 400,
        };
      }

      const subCategories = await this.masterModel.find({
        dropdown_type: 'sub_category',
        category_id: { $in: objectIdArray },
        is_deleted: 0
      }).lean();

      return {
        message: 'Subcategories fetched successfully!',
        statusCode: 200,
        data: subCategories
      };
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return {
        message: 'An error occurred while fetching the subcategories',
        statusCode: 500,
        error: error.message
      };
    }
  }

  async searchByNameAndDescription(category: any, dropdown_type: any): Promise<any> {
    try {

      const catData = await this.masterModel.find({
        dropdown_type: dropdown_type,
        $or: [
          { name: { $regex: category, $options: 'i' } },
          { description: { $regex: category, $options: 'i' } }
        ]
      }).exec();
      if (!catData) {
        throw new Error(`Data not found with : ${category}`);
      }
      console.log(
        dropdown_type, category)
      return {
        message: 'Data successfully fetched!',
        statusCode: 201,
        result: catData,
      };
    } catch (error) {
      console.error('Error fetching data:', error);

      return {
        message: 'An error occurred while fetching the data',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async findAllSuscribers(
    page: number,
    pageSize: number,
    search?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const filter: any = {};

    if (search) {
      filter.email = {
        $regex: search,
        $options: 'i',
      };
    }

    const result = await this.suscribeModel.aggregate([
      { $match: filter },
      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: pageSize },

      // ── Step 1: lookup groupingemails by email ──
      {
        $lookup: {
          from: 'groupingEmails',
          localField: 'email',
          foreignField: 'email',
          as: 'groupingData',
        },
      },

      // ── Step 2: unwind so we can join on groupId ──
      {
        $unwind: {
          path: '$groupingData',
          preserveNullAndEmptyArrays: true,  // ← correct property name
        },
      },

      // ── Step 3: lookup groupForEmail by groupId ──
      {
        $lookup: {
          from: 'groupForEmail',
          let: { gid: '$groupingData.groupId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$gid'] },
              },
            },
          ],
          as: 'groupData',
        },
      },

      // ── Step 4: project clean response ──
      {
        $project: {
          _id: 1,
          email: 1,
          date: 1,
          modified: 1,
          // groupingData: 1,
          groupId: {
            $arrayElemAt: ['$groupData._id', 0],
          },
          groupName: {
            $arrayElemAt: ['$groupData.groupName', 0],
          },
        },
      },
    ]);

    const totalCount = await this.suscribeModel.countDocuments(filter);

    return {
      message: 'Data successfully fetched!',
      statusCode: 200,
      result,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async updateSubscriberEmail(id: string, email: string) {
    const updatedSubscriber = await this.suscribeModel.findByIdAndUpdate(
      id,
      { email },
      { new: true }
    );

    if (!updatedSubscriber) {
      return {
        message: 'Subscriber not found!',
        statusCode: 404,
      };
    }

    return {
      message: 'Email updated successfully!',
      statusCode: 200,
      result: updatedSubscriber,
    };
  }


}