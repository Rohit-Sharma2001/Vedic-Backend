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
import { EventManagementService } from './event_management.services';
import { EventManagement } from 'src/schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express, Response } from 'express';

@Controller('event_management')
@UseInterceptors(Base64Interceptor)
export class EventManagementController {
  constructor(private readonly eventService: EventManagementService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[]; coverImage?: Express.Multer.File[]; icon_file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const eventData: Partial<EventManagement> = JSON.parse(decodedData);

      if (files.file && files.file[0]) eventData['file'] = files.file[0].path;
      if (files.coverImage && files.coverImage[0]) eventData['coverImage'] = files.coverImage[0].path;
      if (files.icon_file && files.icon_file[0]) eventData['icon_file'] = files.icon_file[0].path;

      const createdEvent = await this.eventService.create(eventData);

      return {
        message: 'Event successfully added!',
        statusCode: 201,
        data: createdEvent,
      };
    } catch (error) {
      console.error('Error adding event:', error);
      return { message: 'Error adding event', statusCode: 400, error: error.message };
    }
  }

  @Post('all')
  async findAll(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);

      const page = payload['page'] || 1;
      const pageSize = payload['pageSize'] || 10;
      const eventName = payload['eventname'] || '';
      const all = payload['all'] || false;
      const eventFilter = payload['eventFilter']||"all"

      return this.eventService.findAll(page, pageSize, eventName, all,payload?.sortBy, payload?.sortOrder,eventFilter);
    } catch (error) {
      console.error('Error fetching events:', error);
      return { message: 'Error fetching events', statusCode: 500, error: error.message };
    }
  }

  @Post('view')
  async findOne(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const id = payload['id'];

      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID format', statusCode: 400 };

      return this.eventService.findOneById(id);
    } catch (error) {
      console.error('Error fetching event:', error);
      return { message: 'Error fetching event', statusCode: 500, error: error.message };
    }
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[]; coverImage?: Express.Multer.File[]; icon_file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      if (!data) throw new Error('Encrypted data is missing');
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const updateData: Partial<EventManagement> = JSON.parse(decodedData);

      if (files.file && files.file[0]) updateData['file'] = files.file[0].path;
      if (files.coverImage && files.coverImage[0]) updateData['coverImage'] = files.coverImage[0].path;
      if (files.icon_file && files.icon_file[0]) updateData['icon_file'] = files.icon_file[0].path;

      const updatedEvent = await this.eventService.update(id, updateData);

      return { message: 'Event updated successfully', statusCode: 200, data: updatedEvent };
    } catch (error) {
      console.error('Error updating event:', error);
      return { message: 'Error updating event', statusCode: 400, error: error.message };
    }
  }

  @Post('delete')
  async delete(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const id = payload['id'];

      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID format', statusCode: 400 };

      return this.eventService.delete(id);
    } catch (error) {
      console.error('Error deleting event:', error);
      return { message: 'Error deleting event', statusCode: 500, error: error.message };
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

    if (!id) return { message: 'Event ID is required', statusCode: 400 };

    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid Event ID format', statusCode: 400 };
    }

    // Call service method
    const result = await this.eventService.toggleStatus(id);
    return result;

  } catch (error) {
    console.error('Error toggling event status:', error);
    return { message: 'Error toggling event status', statusCode: 500, error: error.message };
  }
}

  @Post('createEventPayment')
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
      
      return this.eventService.createEventPaymentLink(eventPaymentData);

    } catch (error) {
      console.error('Error creating event payment:', error);

      return {
        message: 'An error occurred while creating event payment',
        statusCode: 500,
        error: error.message
      };
    }
  }

  @Get('eventPaymentSuccess/:id')
  async eventPaymentSuccess(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Received Event Payment ID: ${id}`);
      
      // Check if session ID is valid
      if (!id || id === 'undefined' || id === 'null') {
        console.error('Invalid session ID received:', id);
        const fallbackUrl = `${process.env.FRONTEND_URL}/Events/Thankyou?status=error&reason=Invalid%20session%20ID`;
        return res.redirect(302, fallbackUrl);
      }

      const redirectUrl = await this.eventService.eventPaymentSuccess(id);
      console.log(redirectUrl, "event payment success redirect");
      
      // Always redirect to frontend (success or failure)
      if (!redirectUrl || typeof redirectUrl !== 'object' || !redirectUrl.paymentUrl) {
        console.error('Invalid redirect URL received:', redirectUrl);
        const fallbackUrl = `${process.env.FRONTEND_URL}/Events/Thankyou?status=error&reason=Invalid%20redirect%20URL`;
        return res.redirect(302, fallbackUrl);
      }
      
      return res.redirect(302, redirectUrl.paymentUrl);

    } catch (error) {
      console.error('Error processing event payment:', error);
      const fallbackUrl = `${process.env.FRONTEND_URL}/Events/Thankyou?status=error&reason=${encodeURIComponent(error.message)}`;
      return res.redirect(302, fallbackUrl);
    }
  }

  // Alternative endpoint to handle payment success with query parameters
  @Get('eventPaymentSuccess')
  async eventPaymentSuccessQuery(@Query('session_id') sessionId: string, @Res() res: Response) {
    try {
      console.log(`Received Event Payment ID via query: ${sessionId}`);
      
      if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
        console.error('Invalid session ID received via query:', sessionId);
        const fallbackUrl = `${process.env.FRONTEND_URL}/Events/Thankyou?status=error&reason=Invalid%20session%20ID`;
        return res.redirect(302, fallbackUrl);
      }

      const redirectUrl = await this.eventService.eventPaymentSuccess(sessionId);
      console.log(redirectUrl, "event payment success redirect");
      
      if (!redirectUrl || typeof redirectUrl !== 'object' || !redirectUrl.paymentUrl) {
        console.error('Invalid redirect URL received:', redirectUrl);
        const fallbackUrl = `${process.env.FRONTEND_URL}/Events/Thankyou?status=error&reason=Invalid%20redirect%20URL`;
        return res.redirect(302, fallbackUrl);
      }
      
      return res.redirect(302, redirectUrl.paymentUrl);

    } catch (error) {
      console.error('Error processing event payment via query:', error);
      const fallbackUrl = `${process.env.FRONTEND_URL}/Events/Thankyou?status=error&reason=${encodeURIComponent(error.message)}`;
      return res.redirect(302, fallbackUrl);
    }
  }


  @Post('getAllEventBookings')
  async getAllEventBookings(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      
      const page = payload.page || 1;
      const pageSize = payload.pageSize || 10;

      return this.eventService.getAllEventBookings(page, pageSize);
    } catch (error) {
      console.error('Error fetching event bookings:', error);
      return {
        message: 'Error fetching event bookings',
        statusCode: 500,
        error: error.message
      };
    }
  }

   @Post('getUserEventBookings')
  async getUserEventBookings(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      
      const page = payload.page || 1;
      const pageSize = payload.pageSize || 10;

      return this.eventService.getUserEventBookings(payload?.user_id);
    } catch (error) {
      console.error('Error fetching event bookings:', error);
      return {
        message: 'Error fetching event bookings',
        statusCode: 500,
        error: error.message
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
        return { message: 'Invalid Event ID format', statusCode: 400 };
      }

      return this.eventService.getEventBookingsByEventId(eventId);
    } catch (error) {
      console.error('Error fetching event bookings by event ID:', error);
      return {
        message: 'Error fetching event bookings',
        statusCode: 500,
        error: error.message
      };
    }
  }

  @Post('getTicketsBookedForEvent')
  async getTicketsBookedForEvent(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      
      const eventId = payload.eventId;
      
      if (!eventId) {
        return { message: 'Event ID is required', statusCode: 400 };
      }

      if (!Types.ObjectId.isValid(eventId)) {
        return { message: 'Invalid Event ID format', statusCode: 400 };
      }

      return this.eventService.getTicketsBookedForEvent(eventId);
    } catch (error) {
      console.error('Error fetching tickets booked for event:', error);
      return {
        message: 'Error fetching tickets booked for event',
        statusCode: 500,
        error: error.message
      };
    }
  }

  @Post('createEventRSVP')
async createEventRSVP(@Body('data') data: string) {
  try {
    if (!data) throw new Error('Encrypted data is missing');
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const rsvpData = JSON.parse(decodedData);

    const { eventId, userId, quantity } = rsvpData;
    if (!eventId || !userId) {
      return { message: 'Missing eventId or userId', statusCode: 400 };
    }

    const result = await this.eventService.createEventRSVP(rsvpData);
    return result;
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return { message: 'Error creating RSVP', statusCode: 500, error: error.message };
  }
}

 @Post('findByUserEvents')
  async findByUser(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const id = payload['id'];

      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID format', statusCode: 400 };

      return this.eventService.findByUser(id);
    } catch (error) {
      console.error('Error fetching event:', error);
      return { message: 'Error fetching event', statusCode: 500, error: error.message };
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

    return await this.eventService.downloadEventTicketDetails(id, res);

  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      message: "Download failed",
      error: error.message
    });
  }
}

@Post('createDuplicateEvent')
async createDuplicateEvent(@Body('data') data: string) {
  try {
    if (!data) {
      return { message: 'Missing data',statusCode:400  };
    }

    let payload: any;

    // ✅ Decode base64 safely
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      payload = JSON.parse(decoded);
    } catch {
      return { message: 'Invalid encoded data',statusCode:400 };
    }

    const id = payload?.id;

    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ID format',statusCode:400  };
    }

    return await this.eventService.createDuplicateEvent(id);

  } catch (error) {
    console.error("Controller Error:", error);
    return {
      message: "Download failed",
      error: error.message,
      statusCode:500 
    };
  }
}

}
