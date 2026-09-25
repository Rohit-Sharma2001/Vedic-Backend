import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query, Response } from '@nestjs/common';
import { YogaVideos } from '../../schema/schema';
import { YogaVideosService } from './yoga_videos.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Model, Types } from 'mongoose';

@Controller('yoga_videos')
@UseInterceptors(Base64Interceptor)
export class YogaVideoController {
  constructor(private readonly yogaVideosService: YogaVideosService) { }

  @Post('addYogaVideo')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { coverImage?: Express.Multer.File[]; },
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
      const result: Partial<YogaVideos> = JSON.parse(decodedData);

      console.log('Decoded result:', result);

      if (files.coverImage && files.coverImage[0]) {
        result['coverImage'] = files.coverImage[0].path;
      }
      if (result) {
        result['categoryId'] = new Types.ObjectId(result.categoryId);
      }
      if (result) {
        result['employeeId'] = new Types.ObjectId(result.employeeId);
      }
      if (result.levelId) {
        result['levelId'] = new Types.ObjectId(result.levelId);
      }
      console.log(result, "Final Result to Save");

      // Call the service to create the result
      const createdResult = await this.yogaVideosService.create1(result);
      if (createdResult['statusCode']) {
        return createdResult
      } else
        // Return a success message
        return {
          message: 'Yoga video successfully saved!',
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
      const result: Partial<YogaVideos> = JSON.parse(decodedData);
      console.log(result, "result");

      const page = result['page'] || 1;
      const pageSize = result['pageSize'] || 10;


      return this.yogaVideosService.findAll(page, pageSize);

    } catch (error) {
      console.error('Error fetching results:', error);

      return {
        message: 'An error occurred while fetching the journeys',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('findById')
  async findById(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<YogaVideos> = JSON.parse(decodedData);
      console.log(result, "result");

      const page = result['page'] || 1;
      const pageSize = result['pageSize'] || 10;
      const categoryId = result['categoryId']
      const videoId = result['videoId']

      return this.yogaVideosService.findById(categoryId, videoId, page, pageSize);

    } catch (error) {
      console.error('Error fetching results:', error);

      return {
        message: 'An error occurred while fetching the journeys',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('findYogaVideoById')
  async findVideoById(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: Partial<YogaVideos> = JSON.parse(decodedData);
      console.log(result, "result");

      const page = result['page'] || 1;
      const pageSize = result['pageSize'] || 10;
      // const categoryId = result['categoryId']
      const videoId = result['videoId']
      const user_id = result['user_id']

      return this.yogaVideosService.findVideoById(videoId, user_id, page, pageSize);

    } catch (error) {
      console.error('Error fetching results:', error);

      return {
        message: 'An error occurred while fetching the journeys',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  @Post('updateVideoDetails/:id')
  async updateVideoDetails(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { coverImage?: Express.Multer.File[]; },
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
      const result = JSON.parse(decodedData);

      console.log('Decoded result:', result);

      if (files.coverImage && files.coverImage[0]) {
        result['coverImage'] = files.coverImage[0].path;
      }
      if (result.categoryId) {
        result['categoryId'] = new Types.ObjectId(result.categoryId);
      }
      if (result.employeeId) {
        result['employeeId'] = new Types.ObjectId(result.employeeId);
      }
      if (result.levelId) {
        result['levelId'] = new Types.ObjectId(result.levelId);
      }
      if (!id) {
        return {
          message: 'Please send Yoga video _id',
          statusCode: 204
        };
      }
      const _id = new Types.ObjectId(id);
      console.log(result, "Final Result to Save");

      // Call the service to create the result
      const createdResult = await this.yogaVideosService.updateVideoDetails(_id, result);

      // Return a success message
      return {
        message: 'Yoga video successfully saved!',
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
  @Post('deleteVideo')
  async deleteVideo(@Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);

      if (!result._id) {
        return {
          message: 'Video _id is required',
          statusCode: 400,
        };
      }

      const _id = new Types.ObjectId(result._id);
      const deleteResult = await this.yogaVideosService.deleteVideoById(_id);

      return deleteResult;
    } catch (error) {
      console.error('Error deleting video:', error);
      return {
        message: 'Failed to delete video',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('toggleVideoStatus')
  async toggleVideoStatus(@Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);

      if (!result._id) {
        return {
          message: 'Video _id is required',
          statusCode: 400,
        };
      }

      const _id = new Types.ObjectId(result._id);
      const toggleResult = await this.yogaVideosService.toggleVideoStatus(_id);

      return toggleResult;
    } catch (error) {
      console.error('Error toggling video status:', error);
      return {
        message: 'Failed to toggle video status',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('findVideosByUserid')
  async findVideosByUserid(@Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);
      const page = result['page'] || 1;
      const pageSize = result['pageSize'] || 10;

      if (!result.user_id) {
        return {
          message: 'User_id is required',
          statusCode: 400,
        };
      }

      // const _id = new Types.ObjectId(result._id);
      const toggleResult = await this.yogaVideosService.findVideosByUserid(result.user_id, page, pageSize);

      return toggleResult;
    } catch (error) {
      console.error('Error toggling video status:', error);
      return {
        message: 'Failed to toggle video status',
        statusCode: 500,
        error: error.message,
      };
    }
  }

}