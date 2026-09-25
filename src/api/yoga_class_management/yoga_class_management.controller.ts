import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  Param,
  UseInterceptors,
  Get,
  Res,
  Query,
} from '@nestjs/common';
import { YogaClassManagementService } from './yoga_class_management.services';
import { YogaClassManagement } from 'src/schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express, Response } from 'express';

@Controller('yoga_class_management')
@UseInterceptors(Base64Interceptor)
export class YogaClassManagementController {
  constructor(private readonly classService: YogaClassManagementService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
      icon_file?: Express.Multer.File[];
    },
    @Body('data') data: string,
  ) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const classData: Partial<YogaClassManagement> =
        JSON.parse(decodedData);

      if (files.file && files.file[0]) {
        classData['file'] = files.file[0].path;
      }

      if (files.coverImage && files.coverImage[0]) {
        classData['coverImage'] = files.coverImage[0].path;
      }

      if (files.icon_file && files.icon_file[0]) {
        classData['icon_file'] = files.icon_file[0].path;
      }

      const createdClass =
        await this.classService.create(classData);

      return {
        message: 'Yoga class successfully added!',
        statusCode: 201,
        data: createdClass,
      };
    } catch (error) {
      console.error('Error adding yoga class:', error);

      return {
        message: 'Error adding yoga class',
        statusCode: 400,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }

  @Post('all')
  async findAll(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const payload: Partial<YogaClassManagement> =
        JSON.parse(decodedData);

      const page = payload['page'] || 1;

      const pageSize = payload['pageSize'] || 10;

      const classname = payload['classname'] || '';

      const all = payload['all'] || false;

      return this.classService.findAll(
        page,
        pageSize,
        classname,
        all,
      );
    } catch (error) {
      console.error('Error fetching yoga classes:', error);

      return {
        message: 'Error fetching yoga classes',
        statusCode: 500,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }

  @Post('view')
  async findOne(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const payload = JSON.parse(decodedData);

      const id = payload['id'];

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ID format',
          statusCode: 400,
        };
      }

      return this.classService.findOneById(id);
    } catch (error) {
      console.error('Error fetching yoga class:', error);

      return {
        message: 'Error fetching yoga class',
        statusCode: 500,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,

    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
      icon_file?: Express.Multer.File[];
    },

    @Body('data') data: string,
  ) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const updateData: Partial<YogaClassManagement> =
        JSON.parse(decodedData);

      if (files.file && files.file[0]) {
        updateData['file'] = files.file[0].path;
      }

      if (files.coverImage && files.coverImage[0]) {
        updateData['coverImage'] = files.coverImage[0].path;
      }

      if (files.icon_file && files.icon_file[0]) {
        updateData['icon_file'] = files.icon_file[0].path;
      }

      const updatedClass =
        await this.classService.update(id, updateData);

      return {
        message: 'Yoga class updated successfully',
        statusCode: 200,
        data: updatedClass,
      };
    } catch (error) {
      console.error('Error updating yoga class:', error);

      return {
        message: 'Error updating yoga class',
        statusCode: 400,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }

  @Post('delete')
  async delete(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const payload = JSON.parse(decodedData);

      const id = payload['id'];

      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ID format',
          statusCode: 400,
        };
      }

      return this.classService.delete(id);
    } catch (error) {
      console.error('Error deleting yoga class:', error);

      return {
        message: 'Error deleting yoga class',
        statusCode: 500,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      };
    }
  }


  @Post('update-status')
  async toggleStatus(@Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      // Decode base64 data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData = JSON.parse(decodedData);
      const id = parsedData.id;

      if (!id) return { message: 'Class ID is required', statusCode: 400 };

      if (!Types.ObjectId.isValid(id)) {
        return { message: 'Invalid Class ID format', statusCode: 400 };
      }

      // Call service method
      const result = await this.classService.toggleStatus(id);
      return result;

    } catch (error) {
      console.error('Error toggling class status:', error);
      return {
        message: 'Error updating class',
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Post('createYogaClassPayment')
  async createEventPayment(@Request() req: any, @Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const eventPaymentData: any = JSON.parse(decodedData);
      console.log(eventPaymentData, "eventPaymentData");
      // Derive a reliable base URL from the incoming request (works behind proxies)
      const forwardedProto = req?.headers?.['x-forwarded-proto'];
      const hostHeader = req?.headers?.host;
      const protocol = forwardedProto ? forwardedProto.split(',')[0] : (req?.protocol || 'http');
      const derivedBaseUrl = hostHeader ? `${protocol}://${hostHeader}` : undefined;
      eventPaymentData.baseUrl = derivedBaseUrl;

      return this.classService.createEventPaymentLink(eventPaymentData);

    } catch (error) {
      console.error('Error creating Class payment:', error);

      return {
        message: 'Error updating Class',
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Get('eventPaymentSuccess/:id')
  async eventPaymentSuccess(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Received Class Payment ID: ${id}`);

      // Check if session ID is valid
      if (!id || id === 'undefined' || id === 'null') {
        console.error('Invalid session ID received:', id);
        const fallbackUrl = `${process.env.FRONTEND_URL}/YogaClasses/components/Thankyou?status=error&reason=Invalid%20session%20ID`;
        return res.redirect(302, fallbackUrl);
      }

      const redirectUrl = await this.classService.eventPaymentSuccess(id);
      console.log(redirectUrl, "Class payment success redirect");

      // Always redirect to frontend (success or failure)
      if (!redirectUrl || typeof redirectUrl !== 'object' || !redirectUrl.paymentUrl) {
        console.error('Invalid redirect URL received:', redirectUrl);
        const fallbackUrl = `${process.env.FRONTEND_URL}/YogaClasses/components/Thankyou?status=error&reason=Invalid%20redirect%20URL`;
        return res.redirect(302, fallbackUrl);
      }

      return res.redirect(302, redirectUrl.paymentUrl);

    } catch (error) {
      console.error('Error processing Class payment:', error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      const fallbackUrl = `${process.env.FRONTEND_URL
        }/YogaClasses/components/Thankyou?status=error&reason=${encodeURIComponent(errorMessage)}`;

      return res.redirect(302, fallbackUrl);
    }
  }

  // Alternative endpoint to handle payment success with query parameters
  @Get('eventPaymentSuccess')
  async eventPaymentSuccessQuery(@Query('session_id') sessionId: string, @Res() res: Response) {
    try {
      console.log(`Received Class Payment ID via query: ${sessionId}`);

      if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
        console.error('Invalid session ID received via query:', sessionId);
        const fallbackUrl = `${process.env.FRONTEND_URL}/YogaClasses/components/Thankyou?status=error&reason=Invalid%20session%20ID`;
        return res.redirect(302, fallbackUrl);
      }

      const redirectUrl = await this.classService.eventPaymentSuccess(sessionId);
      console.log(redirectUrl, "Class payment success redirect");

      if (!redirectUrl || typeof redirectUrl !== 'object' || !redirectUrl.paymentUrl) {
        console.error('Invalid redirect URL received:', redirectUrl);
        const fallbackUrl = `${process.env.FRONTEND_URL}/YogaClasses/components/Thankyou?status=error&reason=Invalid%20redirect%20URL`;
        return res.redirect(302, fallbackUrl);
      }

      return res.redirect(302, redirectUrl.paymentUrl);

    } catch (error) {
      console.error('Error processing Class payment via query:', error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      const fallbackUrl = `${process.env.FRONTEND_URL
        }/YogaClasses/components/Thankyou?status=error&reason=${encodeURIComponent(errorMessage)}`;

      return res.redirect(302, fallbackUrl);
    }
  }


  @Post('getAllYogaClassBookings')
  async getAllYogaClassBookings(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);

      const page = payload.page || 1;
      const pageSize = payload.pageSize || 10;

      return this.classService.getAllYogaClassBookings(page, pageSize);
    } catch (error) {
      console.error('Error fetching Class bookings:', error);
      return {
        message: 'Error updating Class',
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Post('getUserYogaClassBookings')
  async getUserYogaClassBookings(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);

      const page = payload.page || 1;
      const pageSize = payload.pageSize || 10;

      return this.classService.getUserYogaClassBookings(payload?.user_id);
    } catch (error) {
      console.error('Error fetching Class bookings:', error);
      return {
        message: 'Error updating Class',
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Post('getEventBookingsByEventId')
  async getEventBookingsByEventId(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);

      const eventId = payload.eventId;

      if (!Types.ObjectId.isValid(eventId)) {
        return { message: 'Invalid Class ID format', statusCode: 400 };
      }

      return this.classService.getEventBookingsByEventId(eventId);
    } catch (error) {
      console.error('Error fetching Class bookings by Class ID:', error);
      return {
        message: 'Error updating Class',
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Post('getTicketsBookedForYogaClass')
  async getTicketsBookedForYogaClass(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);

      const classId = payload.classId;

      if (!classId) {
        return { message: 'Class ID is required', statusCode: 400 };
      }

      if (!Types.ObjectId.isValid(classId)) {
        return { message: 'Invalid class ID format', statusCode: 400 };
      }

      return this.classService.getTicketsBookedForClass(classId);
    } catch (error) {
      console.error('Error fetching tickets booked for class:', error);
      return {
        message: 'Error updating class',
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Post('createYogaClassRSVP')
  async createEventRSVP(@Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const rsvpData = JSON.parse(decodedData);

      const { classId, userId, quantity } = rsvpData;
      if (!classId || !userId) {
        return { message: 'Missing classId or userId', statusCode: 400 };
      }

      const result = await this.classService.createEventRSVP(rsvpData);
      return result;
    } catch (error) {
      console.error('Error creating RSVP:', error);
      return {
        message: 'Error updating Class',
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Post('findByUserEvents')
  async findByUser(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const id = payload['id'];

      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID format', statusCode: 400 };

      return this.classService.findByUser(id);
    } catch (error) {
      console.error('Error fetching Class:', error);
      return {
        message: 'Error updating Class',
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Post('downloadTickets')
  async downloadTickets(
    @Body('data') data: string,
    @Res() res: Response
  ) {
    try {
      if (!data) {
        return res.status(400).json({ message: 'Missing data' });
      }

      let payload: any;

      // ✅ Decode base64 safely
      try {
        const decoded = Buffer.from(data, 'base64').toString('utf-8');
        payload = JSON.parse(decoded);
      } catch {
        return res.status(400).json({ message: 'Invalid encoded data' });
      }

      const id = payload?.id;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      return await this.classService.downloadEventTicketDetails(id, res);

    } catch (error) {
      console.error("Controller Error:", error);
      return {
        message: 'Error updating Class',
        statusCode: 500,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

}
