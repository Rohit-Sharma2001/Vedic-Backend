// src/modules/course_management/course_management.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Param,
  Request,
  UseInterceptors,
  UploadedFiles, // ✅ ADD
} from '@nestjs/common';
import { CourseManagementService } from './course_management.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Response } from 'express';

@Controller('course_management')
@UseInterceptors(Base64Interceptor)
export class CourseManagementController {
  constructor(private readonly courseService: CourseManagementService) { }

  // ✅ ADD icon_file upload (like Master)
  @Post('add')
  async addCourse(
    @Request() req: Request,
    @UploadedFiles() files: { icon_file?: Express.Multer.File[] }, // ✅ ADD
    @Body('data') data: string
  ) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);

      // ✅ Handle categoryId as ObjectId
      if (payload.categoryId) {
        payload.categoryId = new Types.ObjectId(payload.categoryId);
      }

      // ✅ Handle icon_file upload
      if (files?.icon_file && files.icon_file[0]) {
        payload.icon_file = files.icon_file[0].path;
      }

      // ✅ Map courseContent as before
      if (payload.courseContent && Array.isArray(payload.courseContent)) {
        payload.courseContent = payload.courseContent.map((section) => ({
          sectionTitle: section.sectionTitle,
          lectures: (section.lectures || []).map((lecture) => ({
            type: lecture.type,
            title: lecture.title,
            videoCategoryId: lecture.videoCategoryId
              ? new Types.ObjectId(lecture.videoCategoryId)
              : null,
            videoId: lecture.videoId ? new Types.ObjectId(lecture.videoId) : null,
            documentId: lecture.documentId
              ? new Types.ObjectId(lecture.documentId)
              : null,
            documentFile: lecture.documentFile || null,
          })),
        }));
      }

      if (payload.learnings && Array.isArray(payload.learnings)) {
        payload.learnings = payload.learnings.map((item) => ({
          title: item.title?.trim(),
        }));
      }

      return this.courseService.createCourse(payload);
    } catch (error) {
      console.error('Error adding course:', error);
      return {
        message: 'Invalid data format or server error',
        statusCode: 400,
        error: error.message,
      };
    }
  }
  @Post('getAll')
  async getAll(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const page = payload.page || 1;
      const pageSize = payload.pageSize || 10;

      return this.courseService.getAllCourses(page, pageSize);
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return { message: 'Server error', statusCode: 500, error: error.message };
    }
  }

  @Post('getById')
  async getById(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);

      const { _id, user_id } = payload;
      console.log(payload, "lkl")
      // ✅ Pass user_id to service layer
      return this.courseService.getCourseById(_id, user_id);
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      return { message: 'Server error', statusCode: 500, error: error.message };
    }
  }

  @Post('rate')
  async rateCourse(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const { course_id, user_id, rating } = payload;

      return this.courseService.rateCourse({ course_id, user_id, rating });
    } catch (error) {
      console.error('Error rating course:', error);
      return { message: 'Server error', statusCode: 500, error: error.message };
    }
  }


  // ✅ UPDATE endpoint to handle new icon_file upload
  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { icon_file?: Express.Multer.File[] }, // ✅ ADD
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);


      // ✅ Handle icon_file update
      if (files?.icon_file && files.icon_file[0]) {
        payload.icon_file = files.icon_file[0].path;
      } else {
        delete payload.icon_file; // ✅ don’t overwrite existing image
      }


      if (payload.categoryId && Types.ObjectId.isValid(payload.categoryId)) {
        payload.categoryId = new Types.ObjectId(payload.categoryId);
      } else {
        delete payload.categoryId;
      }

      if (payload.courseContent && Array.isArray(payload.courseContent)) {
        payload.courseContent = payload.courseContent.map((section) => ({
          sectionTitle: section.sectionTitle,
          lectures: (section.lectures || []).map((lecture) => ({
            type: lecture.type,
            title: lecture.title,
            videoCategoryId:
              lecture.videoCategoryId && Types.ObjectId.isValid(lecture.videoCategoryId)
                ? new Types.ObjectId(lecture.videoCategoryId)
                : null,
            videoId:
              lecture.videoId && Types.ObjectId.isValid(lecture.videoId)
                ? new Types.ObjectId(lecture.videoId)
                : null,
            documentId:
              lecture.documentId && Types.ObjectId.isValid(lecture.documentId)
                ? new Types.ObjectId(lecture.documentId)
                : null,
            documentFile: lecture.documentFile || null,
          })),
        }));
      }


      return this.courseService.updateCourse(id, payload);
    } catch (error) {
      console.error('Error updating course:', error);
      return {
        message: 'Server error',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('delete')
  async delete(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      return this.courseService.deleteCourse(payload._id);
    } catch (error) {
      console.error('Error deleting course:', error);
      return { message: 'Server error', statusCode: 500, error: error.message };
    }
  }

  // ✅ Toggle course status (activate/deactivate)
  @Post('toggleStatus')
  async toggleStatus(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);

      if (!payload._id) {
        return { message: 'Course ID is required', statusCode: 400 };
      }

      return this.courseService.toggleCourseStatus(payload._id);
    } catch (error) {
      console.error('Error toggling course status:', error);
      return { message: 'Server error', statusCode: 500, error: error.message };
    }
  }


  @Post('paymentLink')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);

      const created = await this.courseService.createPaymentLink(result);

      return {
        message: 'Membership buy successfully!',
        statusCode: 201,
        data: created,
      };
    } catch (error) {
      console.log(error)
      return {
        message: 'Failed to membership buy',
        statusCode: 400,
        error: error.message,
      };
    }
  }


  @Get('paymentSuccess/:id')
  async payment(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Received ID: ${id}`);
      const redirectUrl = await this.courseService.paymentSuccess(id);
      console.log(redirectUrl, "lkoiu")
      if (redirectUrl.statusCode == 200) {
        if (!redirectUrl || typeof redirectUrl !== 'object') {
          throw new Error('Invalid redirect URL');
        }
        res.redirect(302, redirectUrl.paymentUrl);
      } else {
        return res.status(500).json(redirectUrl)
      }

    } catch (error) {
      console.error('Error processing payment:', error);

      return res.status(500).json({
        message: 'An error occurred while processing the payment',
        statusCode: 500,
        error: error.message
      });
    }
  }

  @Post('transactions')
  async getAllTransactions(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const page = payload.page || 1;
      const pageSize = payload.pageSize || 10;

      const transactions = await this.courseService.getAllCourseTransactions(page, pageSize);

      return {
        message: 'All course transactions fetched successfully!',
        statusCode: 200,
        ...transactions, // includes result, totalCount, totalPages
      };
    } catch (error) {
      console.error('Error fetching course transactions:', error);
      return {
        message: 'Failed to fetch course transactions',
        statusCode: 500,
        error: error.message,
      };
    }
  }

@Post('getCourseAndMembership')
  async getUserCourseAndMembership(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      

      return this.courseService.getCourseAndMembership(payload.user_id);
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return { message: 'Server error', statusCode: 500, error: error.message };
    }
  }


  @Post('increaseView')
async increaseView(@Body('data') data: string) {
  try {
    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);

    if (!payload._id) {
      return { message: 'Course ID is required', statusCode: 400 };
    }

    return this.courseService.increaseViewCount(payload._id);
  } catch (error) {
    console.error('Error increasing view count:', error);
    return { message: 'Server error', statusCode: 500, error: error.message };
  }
}

@Post('getTrendingCourses')
async getTrendingCourses() {
  try {
    return this.courseService.getTrendingCourses();
  } catch (error) {
    console.error('Error fetching trending courses:', error);
    return { message: 'Server error', statusCode: 500, error: error.message };
  }
}


}
