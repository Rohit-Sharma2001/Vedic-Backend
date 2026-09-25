import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;

import { ArticleManagement, ArticleManagementSchema, ArticleManagementDocument } from '../../schema/schema';

@Injectable()
export class ArticleManagementService {
  constructor(@InjectModel(ArticleManagement.name) private articleManagementModel: Model<ArticleManagementDocument>) { }

  async create1(articleData: Partial<ArticleManagement>): Promise<ArticleManagement> {
    const createdArticle = new this.articleManagementModel(articleData);
    return createdArticle.save();
  }

  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const filter: any = {};

    const result = await this.articleManagementModel.find(filter).skip(skip).limit(limit).exec();
    const totalCount = await this.articleManagementModel.countDocuments(filter).exec();

    const hostUrl = `http://localhost:3008`;
    const resultWithUrls = result.map(item => ({
      ...item.toObject(),
      imageUrl: item.file ? `${hostUrl}/${item.file.replace(/\\/g, '/')}` : null,
      commentsCount: item.comments ? item.comments.length : 0,
      likesCount: item.likes ? item.likes.length : 0,
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
      const result = await this.articleManagementModel
        .findOne({ _id: objectId })
        .populate({ path: 'comments.user_id', select: 'name email mobileNo' })
        .populate({ path: 'likes.user_id', select: 'name email mobileNo' })
        .exec();

      if (!result) {
        return {
          message: 'Result not found',
          statusCode: 404,
        };
      }

      const hostUrl = `http://localhost:3008`;
      const resultObj = result.toObject();
      resultObj['imageUrl'] = resultObj.file ? `${hostUrl}/${resultObj.file.replace(/\\/g, '/')}` : null;
      resultObj['commentsCount'] = resultObj.comments ? resultObj.comments.length : 0;
      resultObj['likesCount'] = resultObj.likes ? resultObj.likes.length : 0;

      return {
        message: 'Result successfully fetched!',
        statusCode: 201,
        result: resultObj,
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

  async updateArticle(id: string, resultUpdates: Partial<ArticleManagement>) {
    try {
      const objectId = new Types.ObjectId(id);

      const updatedResult = await this.articleManagementModel.updateOne(
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

  async setFeaturedArticle(id: string) {
  try {
    const objectId = new Types.ObjectId(id);

    // Reset all to 0
    await this.articleManagementModel.updateMany({}, { $set: { is_featured_article: 0 } });

    // Set only this one to 1
    const updatedArticle = await this.articleManagementModel.findOneAndUpdate(
      { _id: objectId },
      { $set: { is_featured_article: 1, modified: new Date() } },
      { new: true }
    );

    if (!updatedArticle) {
      return {
        message: 'Article not found',
        statusCode: 404,
      };
    }

    return {
      message: 'Featured article updated successfully!',
      statusCode: 200,
      data: updatedArticle,
    };
  } catch (error) {
    console.error('Error updating featured article:', error.message);
    return {
      message: 'An error occurred while updating featured article',
      statusCode: 500,
      error: error.message,
    };
  }
}
async getFeaturedArticle() {
  try {
    const featured = await this.articleManagementModel
      .findOne({ is_featured_article: 1 })
      .exec();

    if (!featured) {
      return {
        message: 'No featured article found',
        statusCode: 404,
      };
    }

    const hostUrl = `http://localhost:3008`;
    const featuredWithUrl = {
      ...featured.toObject(),
      imageUrl: featured.file
        ? `${hostUrl}/${featured.file.replace(/\\/g, '/')}`
        : null,
    };

    return {
      message: 'Featured article fetched successfully!',
      statusCode: 200,
      data: featuredWithUrl,
    };
  } catch (error) {
    console.error('Error fetching featured article:', error);
    return {
      message: 'An error occurred while fetching featured article',
      statusCode: 500,
      error: error.message,
    };
  }
}


  async deleteResult(id: string) {
    const objectId = new Types.ObjectId(id);
    const deleteResult = await this.articleManagementModel.deleteOne({ _id: objectId });

    return {
      message: 'Result successfully deleted!',
      statusCode: 200,
      deleteResult,
    };
  }

  // ADD this method in ArticleManagementService
async toggleLike(articleId: string, userId: string) {
  const objectId = new Types.ObjectId(articleId);
  const userObjectId = new Types.ObjectId(userId);

  // check if already liked
  const already = await this.articleManagementModel.findOne({
    _id: objectId,
    'likes.user_id': userObjectId,
  }).select('_id likes');

  let updated;
  if (already) {
    // UNLIKE
    updated = await this.articleManagementModel.findOneAndUpdate(
      { _id: objectId },
      {
        $pull: { likes: { user_id: userObjectId } },
        $set: { modified: new Date() },
      },
      { new: true }
    ).select('_id likes');
    return { action: 'unliked', likesCount: updated?.likes?.length ?? 0, data: updated };
  } else {
    // LIKE
    updated = await this.articleManagementModel.findOneAndUpdate(
      { _id: objectId },
      {
        $push: { likes: { user_id: userObjectId, date: new Date() } },
        $set: { modified: new Date() },
      },
      { new: true }
    ).select('_id likes');
    return { action: 'liked', likesCount: updated?.likes?.length ?? 0, data: updated };
  }
}

async incrementViewCount(id: string) {
  try {
    const objectId = new Types.ObjectId(id);

    const updatedResult = await this.articleManagementModel.findOneAndUpdate(
      { _id: objectId },
      { $inc: { viewCount: 1 }, $set: { modified: new Date() } },
      { new: true }
    );

    if (!updatedResult) {
      return null; // instead of returning { message, statusCode }
    }

    return updatedResult;
  } catch (error) {
    throw new Error('Error incrementing view count: ' + error.message);
  }
}

  async addComment(articleId: string, userId: string, comment: string) {
    const objectId = new Types.ObjectId(articleId);
    const userObjectId = new Types.ObjectId(userId);

    const updated = await this.articleManagementModel.findOneAndUpdate(
      { _id: objectId },
      {
        $push: {
          comments: {
            user_id: userObjectId,
            comment,
            date: new Date(),
          },
        },
        $set: { modified: new Date() },
      },
      { new: true },
    );

    return updated;
  }

  async addLike(articleId: string, userId: string) {
    const objectId = new Types.ObjectId(articleId);
    const userObjectId = new Types.ObjectId(userId);

    const existing = await this.articleManagementModel.findOne({
      _id: objectId,
      'likes.user_id': userObjectId,
    });

    if (existing) {
      return { alreadyLiked: true };
    }

    const updated = await this.articleManagementModel.findOneAndUpdate(
      { _id: objectId },
      {
        $push: {
          likes: {
            user_id: userObjectId,
            date: new Date(),
          },
        },
        $set: { modified: new Date() },
      },
      { new: true },
    );

    return updated;
  }


async deleteComment(articleId: string, commentId: string) {
  try {
    const updatedArticle = await this.articleManagementModel.updateOne(
      {
        _id: new Types.ObjectId(articleId),
      },
      {
        $pull: {
          comments: {
            _id: new Types.ObjectId(commentId),
          },
        },
        $set: {
          modified: new Date(),
        },
      }
    );

    return {
      message: 'Comment deleted successfully!',
      statusCode: 200,
      updatedArticle,
    };
  } catch (error) {
    console.error('Error deleting comment:', error);

    return {
      message: 'An error occurred while deleting the comment',
      statusCode: 500,
      error: error.message,
    };
  }
}



}