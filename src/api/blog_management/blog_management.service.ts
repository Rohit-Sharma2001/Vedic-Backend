import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BlogManagement, BlogManagementDocument, BlogContentManagement, BlogContentManagementDocument } from '../../schema/schema';
let { ObjectId } = require('mongoose').Types;
@Injectable()
export class BlogManagementService {
  constructor(@InjectModel(BlogManagement.name) private blogModel: Model<BlogManagementDocument>,
    @InjectModel(BlogContentManagement.name) private blogContantModel: Model<BlogContentManagementDocument>,) { }

  async create(blogData: Partial<BlogManagement>): Promise<BlogManagement> {
    const createdblog = new this.blogModel(blogData);
    return createdblog.save();
  }

  async findAll(page: number, pageSize: number, centerName?: string) {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const filter: any = {};


    if (centerName) {
      filter.centerName = centerName;
    }

    const BlogManagement = await this.blogModel
      .find(filter).sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCount = await this.blogModel.countDocuments(filter).exec();

    // Add image URLs to CenterManagement
    const hostUrl = `http://localhost:3008`; // Base URL for image serving
    const CenterManagementWithUrls = BlogManagement.map(product => {
      return {
        ...product.toObject(),
        imageUrl: product.file ? `${hostUrl}/${product.file.replace(/\\/g, '/')}` : null, // Append the URL
      };
    });

    return {
      message: 'BlogManagement successfully fetched!',
      statusCode: 201,
      CenterManagementWithUrls,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async findOneById(id: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(id);

      const blogManagementData = await this.blogModel.findOne({ _id: objectId })
      .populate({ path: 'comments.user_id', select: 'name email mobileNo' })
        .populate({ path: 'likes.user_id', select: 'name email mobileNo' })
        .exec();
        

      if (!blogManagementData) {
        throw new Error(`blogManagementData not found with id: ${id}`);
      }
      console.log(blogManagementData.file, "opopopopopopopoop")
      const hostUrl = `http://localhost:3008`;
      if (blogManagementData.file) {
        // Format the file path to use forward slashes
        blogManagementData['imageUrl'] = `${hostUrl}/${blogManagementData.file.replace(/\\/g, '/')}`;
        console.log('Image URL:', blogManagementData['imageUrl']);
      } else {
        blogManagementData['imageUrl'] = null; // Handle cases where no file is present
      }
      // resultObj['commentsCount'] = resultObj.comments ? resultObj.comments.length : 0;
      // resultObj['likesCount'] = resultObj.likes ? resultObj.likes.length : 0;

      return {
        message: 'centerManagementData successfully fetched!',
        statusCode: 201,
        blogManagementData,
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

  async find(id: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(id);

      const blogManagementData = await this.blogModel.findOne({ _id: objectId }).exec();

      if (!blogManagementData) {
        throw new Error(`blogManagementData not found with id: ${id}`);
      }
      console.log(blogManagementData.file, "opopopopopopopoop")
      const hostUrl = `http://localhost:3008`;
      if (blogManagementData.file) {
        // Format the file path to use forward slashes
        blogManagementData['imageUrl'] = `${hostUrl}/${blogManagementData.file.replace(/\\/g, '/')}`;
        console.log('Image URL:', blogManagementData['imageUrl']);
      } else {
        blogManagementData['imageUrl'] = null; // Handle cases where no file is present
      }

      return {
        message: 'centerManagementData successfully fetched!',
        statusCode: 201,
        blogManagementData,
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

  async updateBlog(id: any, blogManagement: Partial<BlogManagement>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id, "AAAAAAAAAAAAAAAAAAA", blogManagement)
      const objectId = new Types.ObjectId(id);
      const updatedBlogManagement = await this.blogModel.updateOne(
        { _id: objectId },
        { $set: blogManagement }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the updated document and validate schema
      );

      if (!updatedBlogManagement) {
        return {
          message: 'Product not found with the provided id',
          statusCode: 404,
          error: `No product found with id: ${id}`,
        };
      }

      // Return success message with updated product
      return {
        message: 'Blog successfully updated!',
        statusCode: 201,
        updatedBlogManagement,
      };
    } catch (error) {
      console.error('Error updating blog in the database:', error);

      // Return error response
      return {
        message: 'An error occurred while updating the Blog',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async deleteBlogManagement(id: any) {
    // The update query
    console.log(id, "uiui")
    const deletedData = await this.blogModel.deleteOne(
      { _id: new ObjectId(id) },
      // data, // Return the updated document
    );
    console.log(deletedData, "deletedData")
    return {
      message: 'File deleted successfully',
      // filePath: file.path,
    };
  }

  async findOneContantById(id: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(id);

      const blogContantManagementData = await this.blogContantModel.findOne({ _id: objectId }).exec();

      if (!blogContantManagementData) {
        throw new Error(`blogManagementData not found with id: ${id}`);
      }
      console.log(blogContantManagementData.file, "opopopopopopopoop")
      const hostUrl = `http://localhost:3008`;
      if (blogContantManagementData.file) {
        // Format the file path to use forward slashes
        blogContantManagementData['imageUrl'] = `${hostUrl}/${blogContantManagementData.file.replace(/\\/g, '/')}`;
        console.log('Image URL:', blogContantManagementData['imageUrl']);
      } else {
        blogContantManagementData['imageUrl'] = null; // Handle cases where no file is present
      }

      return {
        message: 'blogContantManagementData successfully fetched!',
        statusCode: 201,
        blogContantManagementData,
      };
    } catch (error) {
      console.error('Error fetching blogContantManagementData:', error);

      return {
        message: 'An error occurred while fetching the blogContantManagementData',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async updateBlogContant(id: any, blogContentManagement: Partial<BlogContentManagement>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id, "AAAAAAAAAAAAAAAAAAA", blogContentManagement)
      const objectId = new Types.ObjectId(id);
      const updatedBlogManagement = await this.blogContantModel.updateOne(
        { _id: objectId },
        { $set: blogContentManagement }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the updated document and validate schema
      );

      if (!updatedBlogManagement) {
        return {
          message: 'blog not found with the provided id',
          statusCode: 404,
          error: `No blog found with id: ${id}`,
        };
      }

      // Return success message with updated product
      return {
        message: 'Blog contant successfully updated!',
        statusCode: 201,
        updatedBlogManagement,
      };
    } catch (error) {
      console.error('Error updating blog in the database:', error);

      // Return error response
      return {
        message: 'An error occurred while updating the Blog contant',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async createContent(blogData: Partial<BlogContentManagement>): Promise<BlogContentManagement> {
    const createdblog = new this.blogContantModel(blogData);
    return createdblog.save();
  }

  async updateFeaturedPost(id: any, blogFeaturePostManagement: Partial<BlogManagement>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id, "AAAAAAAAAAAAAAAAAAA", blogFeaturePostManagement)
      await this.blogModel.updateOne(
        { isFeaturedPost: 1 },
        { $set: { isFeaturedPost: 0 } }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the updated document and validate schema
      );
      const objectId = new Types.ObjectId(id);
      const updatedBlogManagement = await this.blogModel.updateOne(
        { _id: objectId },
        { $set: { isFeaturedPost: 1 } }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the updated document and validate schema
      );

      if (!updatedBlogManagement) {
        return {
          message: 'isFeaturedPost not found with the provided id',
          statusCode: 404,
          error: `No isFeaturedPost found with id: ${id}`,
        };
      }

      // Return success message with updated product
      return {
        message: 'Blog contant successfully updated!',
        statusCode: 201,
        updatedBlogManagement,
      };
    } catch (error) {
      console.error('Error updating blog in the database:', error);

      // Return error response
      return {
        message: 'An error occurred while updating the Blog contant',
        statusCode: 500,
        error: error.message,
      };
    }
  }

   async addComment(articleId: string, userId: string, comment: string) {
    const objectId = new Types.ObjectId(articleId);
    const userObjectId = new Types.ObjectId(userId);

    const updated = await this.blogModel.findOneAndUpdate(
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

    // ADD this method in ArticleManagementService
  async toggleLike(articleId: string, userId: string) {
    const objectId = new Types.ObjectId(articleId);
    const userObjectId = new Types.ObjectId(userId);
  
    // check if already liked
    const already = await this.blogModel.findOne({
      _id: objectId,
      'likes.user_id': userObjectId,
    }).select('_id likes');
  
    let updated;
    if (already) {
      // UNLIKE
      updated = await this.blogModel.findOneAndUpdate(
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
      updated = await this.blogModel.findOneAndUpdate(
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

  async deleteComment(articleId: string, commentId: string) {
    try {
      const updatedArticle = await this.blogModel.updateOne(
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