import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;

import { AmitaJainSchedule, AmitaJainScheduleSchema, AmitaJainScheduleDocument } from '../../schema/schema';

@Injectable()
export class AmitaJainScheduleService {
  constructor(@InjectModel(AmitaJainSchedule.name) private amitaJainScheduleModel: Model<AmitaJainScheduleDocument>) { }

  async create1(articleData: Partial<AmitaJainSchedule>): Promise<AmitaJainSchedule> {
    const createdArticle = new this.amitaJainScheduleModel(articleData);
    return createdArticle.save();
  }

  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const filter: any = {};

    const result = await this.amitaJainScheduleModel.find(filter).skip(skip).limit(limit).exec();
    const totalCount = await this.amitaJainScheduleModel.countDocuments(filter).exec();

    const hostUrl = `http://localhost:3008`;
    const resultWithUrls = result.map(item => ({
      ...item.toObject(),
      imageUrl: item.image ? `${hostUrl}/${item.image.replace(/\\/g, '/')}` : null,
    }));

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
      const result = await this.amitaJainScheduleModel.findOne({ _id: objectId }).exec();

      if (!result) {
        return {
          message: 'Result not found',
          statusCode: 404,
        };
      }

      const hostUrl = `http://localhost:3008`;
      result['imageUrl'] = result.image ? `${hostUrl}/${result.image.replace(/\\/g, '/')}` : null;

      return {
        message: 'Result successfully fetched!',
        statusCode: 201,
        result,
      };
    } catch (error) {
      console.error('Error fetching result:', error);
      return {
        message: 'An error occurred while fetching the result',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async updateArticle(id: string, resultUpdates: Partial<AmitaJainSchedule>) {
    try {
      const objectId = new Types.ObjectId(id);

      const updatedResult = await this.amitaJainScheduleModel.updateOne(
        { _id: objectId },
        { $set: resultUpdates },
        { new: true, runValidators: true }
      );

      return {
        message: 'Result successfully updated!',
        statusCode: 201,
        updatedResult,
      };
    } catch (error) {
      console.error('Error updating result:', error);
      return {
        message: 'An error occurred while updating the result',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async deleteResult(id: string) {
    const objectId = new Types.ObjectId(id);
    const deleteResult = await this.amitaJainScheduleModel.deleteOne({ _id: objectId });

    return {
      message: 'Result successfully deleted!',
      statusCode: 200,
      deleteResult,
    };
  }





}