import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;

import { CaseStoryProvider, CaseStoryProviderSchema, CaseStoryProviderDocument } from '../../schema/schema';

@Injectable()
export class CaseStoryProviderService {
  constructor(@InjectModel(CaseStoryProvider.name) private caseStoryProviderModel: Model<CaseStoryProviderDocument>) { }

  async create1(articleData: Partial<CaseStoryProvider>): Promise<CaseStoryProvider> {
    const createdArticle = new this.caseStoryProviderModel(articleData);
    return createdArticle.save();
  }

  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const filter: any = {};  // Add filters if needed

    const hostUrl = `http://localhost:3008`;

    // Aggregation pipeline
    const aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'casestorytypes',           // Mongo collection name for caseStoryType (check your actual collection name)
          localField: 'case_story_type_id',   // Field in caseStoryProvider
          foreignField: '_id',                 // Field in caseStoryType collection
          as: 'case_story_type_info'
        }
      },
      {
        $unwind: { path: '$case_story_type_info', preserveNullAndEmptyArrays: true }
      },
      {
       $project: {
  title: 1,
  descriptions: 1,
  image: 1,
  author_name: 1,
  author_designation: 1,
  author_description: 1,
  file: 1,
  viewCount: 1,
  is_featured: 1,
  is_deleted: 1,
  status: 1,
  date: 1,
  modified: 1,
  case_story_type_id: 1,
  case_story_type_name: '$case_story_type_info.name',
}

      },
      // { $skip: skip },
      // { $limit: limit }
    ];

    // Run aggregation to get paginated results
    const results = await this.caseStoryProviderModel.aggregate(aggregationPipeline).exec();
    // Count total documents separately (no need for lookup here)
    const totalCount = await this.caseStoryProviderModel.countDocuments(filter).exec();

    // Add image URLs
    const resultsWithUrls = results.map(item => ({
      ...item,
      
      imageUrl: item.image ? `${hostUrl}/${item.image.replace(/\\/g, '/')}` : null,
authorImageUrl: item.file ? `${hostUrl}/${item.file.replace(/\\/g, '/')}` : null,

    }));

    return {
      message: 'Result successfully fetched!',
      statusCode: 201,
      result: resultsWithUrls,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }


  async findOneById(id: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(id);
      // Aggregation pipeline
      const aggregationPipeline = [
        { $match: { _id: objectId } },
        {
          $lookup: {
            from: 'casestorytypes',           // Mongo collection name for caseStoryType (check your actual collection name)
            localField: 'case_story_type_id',   // Field in caseStoryProvider
            foreignField: '_id',                 // Field in caseStoryType collection
            as: 'case_story_type_info'
          }
        },
        {
          $unwind: { path: '$case_story_type_info', preserveNullAndEmptyArrays: true }
        },
        {
         $project: {
  title: 1,
  descriptions: 1,
  image: 1,
  author_name: 1,
  author_designation: 1,
  author_description: 1,
  file: 1,
  viewCount: 1,
  is_featured: 1,
  is_deleted: 1,
  status: 1,
  date: 1,
  modified: 1,
  case_story_type_id: 1,
  case_story_type_name: '$case_story_type_info.name',
}

        }
      ];
      const result = await this.caseStoryProviderModel.aggregate(aggregationPipeline).exec();

      if (!result) {
        return {
          message: 'Result not found',
          statusCode: 404,
        };
      }

      const hostUrl = `http://localhost:3008`;
      result['imageUrl'] = result[0].image ? `${hostUrl}/${result[0].image.replace(/\\/g, '/')}` : null;
result['authorImageUrl'] = result[0].file ? `${hostUrl}/${result[0].file.replace(/\\/g, '/')}` : null;

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

async updateArticle(id: string, resultUpdates: Partial<CaseStoryProvider>) {
  try {
    const objectId = new Types.ObjectId(id);

    // Apply update
    await this.caseStoryProviderModel.updateOne(
      { _id: objectId },
      { $set: resultUpdates },
      { runValidators: true }
    );

    // Run aggregation to fetch enriched document
    const updatedResult = await this.caseStoryProviderModel.aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: 'casestorytypes',
          localField: 'case_story_type_id',
          foreignField: '_id',
          as: 'case_story_type_info'
        }
      },
      {
        $unwind: {
          path: '$case_story_type_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
       $project: {
  title: 1,
  descriptions: 1,
  image: 1,
  author_name: 1,
  author_designation: 1,
  author_description: 1,
  file: 1,
  viewCount: 1,
  is_featured: 1,
  is_deleted: 1,
  status: 1,
  date: 1,
  modified: 1,
  case_story_type_id: 1,
  case_story_type_name: '$case_story_type_info.name'
}

      }
    ]);

    return {
      message: 'Result successfully updated!',
      statusCode: 200,
      result: updatedResult.length ? updatedResult[0] : null
    };
  } catch (error) {
    console.error('Error updating result:', error);
    return {
      message: 'An error occurred while updating the result',
      statusCode: 500,
      error: error.message
    };
  }
}


  async deleteResult(id: string) {
    const objectId = new Types.ObjectId(id);
    const deleteResult = await this.caseStoryProviderModel.deleteOne({ _id: objectId });

    return {
      message: 'Result successfully deleted!',
      statusCode: 200,
      deleteResult,
    };
  }

async incrementViewCount(id: string) {
  try {
    const objectId = new Types.ObjectId(id);
    const updated = await this.caseStoryProviderModel.findByIdAndUpdate(
      objectId,
      { $inc: { viewCount: 1 }, $set: { modified: new Date() } },
      { new: true }
    );

    if (!updated) {
      return {
        message: 'Data not found',
        statusCode: 404,
      };
    }

    return updated;
  } catch (error) {
    throw new Error('Error incrementing view count: ' + error.message);
  }
}
async setFeatured(id: string) {
  try {
    const objectId = new Types.ObjectId(id);

    // Reset all to 0
    await this.caseStoryProviderModel.updateMany({}, { $set: { is_featured: 0 } });

    // Set target to 1
    const updated = await this.caseStoryProviderModel.findByIdAndUpdate(
      objectId,
      { $set: { is_featured: 1, modified: new Date() } },
      { new: true }
    );

    if (!updated) {
      return {
        message: 'Data not found',
        statusCode: 404,
      };
    }

    return updated;
  } catch (error) {
    throw new Error('Error updating featured flag: ' + error.message);
  }
}




}