import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query, Response } from '@nestjs/common';
import { ArticleManagementService } from './article_management.service';
import { ArticleManagement } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express } from 'express';

@Controller('article_management')
@UseInterceptors(Base64Interceptor)
export class ArticleManagementController {
  constructor(private readonly articleManagementServices: ArticleManagementService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[], image?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<ArticleManagement> = JSON.parse(decodedData);

      console.log('Decoded result:', result);

      // Attach file paths to the result if uploaded
      if (files.file && files.file[0]) {
        result['file'] = files.file[0].path;
      }

      if (files.image && files.image[0]) {
        result['image'] = files.image[0].path;
      }

      // Set default timestamps
      result.date = new Date();
      result.modified = new Date();

      console.log(result, "Final Result to Save");

      // Call the service to create the result
      const createdResult = await this.articleManagementServices.create1(result);

      // Return a success message
      return {
        message: 'Article successfully added!',
        statusCode: 201,
        data: createdResult
      };
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }
  }


  @Post('getAll')
  async findAll(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<ArticleManagement> = JSON.parse(decodedData);
      console.log(result, "result");

      const page = result['page'] || 1;
      const pageSize = result['pageSize'] || 10;


      return this.articleManagementServices.findAll(page, pageSize);

    } catch (error) {
      console.error('Error fetching results:', error);

      return {
        message: 'An error occurred while fetching the journeys',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('view')
  async findOne(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<ArticleManagement> = JSON.parse(decodedData);
      const id = result.id;

      console.log(`Fetching result with id: ${id}`);

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      return await this.articleManagementServices.findOneById(id);
    } catch (error) {
      console.error('Error fetching result:', error);
      return {
        message: 'An error occurred while fetching the result',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[], image?: Express.Multer.File[] },
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) throw new Error('Encrypted data is missing or undefined');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const resultUpdates: Partial<ArticleManagement> = JSON.parse(decodedData);

      if (files.file && files.file[0]) {
        resultUpdates['file'] = files.file[0].path;
      }

      if (files.image && files.image[0]) {
        resultUpdates['image'] = files.image[0].path;
      }

      return await this.articleManagementServices.updateArticle(id, resultUpdates);
    } catch (error) {
      console.error('Error updating journey:', error.message);
      return {
        message: 'Error updating journey',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('delete')
  async deleteProduct(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<ArticleManagement> = JSON.parse(decodedData);
      const id = result.id;

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      return await this.articleManagementServices.deleteResult(id);
    } catch (error) {
      console.error('Error deleting result:', error);
      return {
        message: 'An error occurred while deleting the result',
        statusCode: 500,
        error: error.message,
      };
    }
  }
@Post('incrementView')
async incrementViewCount(@Body('data') data: string) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result: Partial<ArticleManagement> = JSON.parse(decodedData);
    const id = result.id;

    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    const response = await this.articleManagementServices.incrementViewCount(id);

    if (!response) {
      return {
        message: 'Data not found',
        statusCode: 404,
      };
    }

    return {
      message: 'View count incremented successfully',
      statusCode: 200,
      data: response,
    };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return {
      message: 'Failed to increment view count',
      statusCode: 500,
      error: error.message,
    };
  }
}

  @Post('comment')
  async addComment(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload: any = JSON.parse(decodedData);
      const { article_id, user_id, comment } = payload;

      if (!Types.ObjectId.isValid(article_id) || !Types.ObjectId.isValid(user_id)) {
        return { message: 'Invalid ObjectId format', statusCode: 400 };
      }
      if (!comment || typeof comment !== 'string') {
        return { message: 'Comment text is required', statusCode: 400 };
      }

      const updated = await this.articleManagementServices.addComment(article_id, user_id, comment);

      if (!updated) {
        return { message: 'Article not found', statusCode: 404 };
      }

      return {
        message: 'Comment added successfully',
        statusCode: 201,
        data: updated,
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        message: 'Failed to add comment',
        statusCode: 500,
        error: error.message,
      };
    }
  }

// REPLACE the existing @Post('like') with this toggle version
@Post('like')
async likeOrUnlike(@Body('data') data: string) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const payload: any = JSON.parse(decodedData);
    const { article_id, user_id } = payload;

    if (!Types.ObjectId.isValid(article_id) || !Types.ObjectId.isValid(user_id)) {
      return { message: 'Invalid ObjectId format', statusCode: 400 };
    }

    const result = await this.articleManagementServices.toggleLike(article_id, user_id);
    if (!result?.data) return { message: 'Article not found', statusCode: 404 };

    return {
      message: result.action === 'liked' ? 'Article liked' : 'Article unliked',
      statusCode: 200,
      action: result.action,
      likesCount: result.likesCount,
      data: result.data,
    };
  } catch (error) {
    console.error('Error toggling like:', error);
    return {
      message: 'Failed to toggle like',
      statusCode: 500,
      error: error.message,
    };
  }
}


  @Post('set-featured')
async setFeaturedArticle(@Body('data') data: string) {
  try {
    if (!data) throw new Error('Encrypted data is missing');

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result: Partial<ArticleManagement> = JSON.parse(decodedData);
    const id = result.id;

    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    return await this.articleManagementServices.setFeaturedArticle(id);
  } catch (error) {
    console.error('Error setting featured article:', error.message);
    return {
      message: 'Error setting featured article',
      statusCode: 400,
      error: error.message,
    };
  }
}
@Post('get-featured')
async getFeaturedArticle() {
  try {
    return await this.articleManagementServices.getFeaturedArticle();
  } catch (error) {
    console.error('Error fetching featured article:', error.message);
    return {
      message: 'Error fetching featured article',
      statusCode: 500,
      error: error.message,
    };
  }
}



@Post('deleteComment')
  async deleteComment(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);
      const articleId = result.id;
      const commentId = result.commentId

      if (!Types.ObjectId.isValid(articleId)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      return await this.articleManagementServices.deleteComment(articleId, commentId);
    } catch (error) {
      console.error('Error deleting result:', error);
      return {
        message: 'An error occurred while deleting the result',
        statusCode: 500,
        error: error.message,
      };
    }
  }



}