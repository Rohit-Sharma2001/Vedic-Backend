import {
  Controller,
  Post,
  Param,
  Request,
  Body,
  Get,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { AppointmentManagementService } from './appointment_management.service';
import { AppointmentManagement } from 'src/schema/schema';
import { Types } from 'mongoose';
import { Express, Response } from 'express';
import * as moment from 'moment';

@Controller('appointment-management')
@UseInterceptors(Base64Interceptor)
export class AppointmentManagementController {
  constructor(
    private readonly appointmentManagementService: AppointmentManagementService,
  ) { }
  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      //  {
      //     try {
      //       const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      //       const parsedData: Partial<QuizPageContent> = JSON.parse(decodedData);

      //       if (files?.file?.[0]) {
      //         parsedData.file = files.file[0].path;
      //       }

      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      // if (!data) {
      //   throw new Error('Encrypted data is missing');
      // }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      console.log(decodedData, 'decodedData');
      let { appointments } = JSON.parse(decodedData);
      console.log(files,"files")
      if (files?.file?.[0]) {
        appointments.file = files.file[0].path;
      }
      appointments.forEach(e => {
        console.log('Decoded Enquiry:', e);
        e.employeeId = new Types.ObjectId(
          e.employeeId,
        );
        e.serviceId = new Types.ObjectId(
          e.serviceId,
        );
        e.userId = new Types.ObjectId(
          e.userId,
        );
        e.centerId = new Types.ObjectId(
          e.centerId,
        );
        if(appointments.file){
        e.file=appointments.file}
      })
      const createdaddOns = await this.appointmentManagementService.create(
        appointments,
      );

      return {
        message: 'appointment successfully added!',
        statusCode: 201,
        data: createdaddOns,
      };
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('find')
  async find(@Request() req: Request, @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      console.log(decodedData, 'decodedData');
      const appointmentManagement = JSON.parse(decodedData);

      console.log('Decoded Enquiry:', appointmentManagement);
      ['employeeId', 'serviceId', 'userId'].forEach((key) => {
        if (appointmentManagement[key] && !Array.isArray(appointmentManagement[key])) {
          appointmentManagement[key] = new Types.ObjectId(appointmentManagement[key]);
        }
      });

      // Handle _id separately
      if (appointmentManagement._id) {
        const ids = Array.isArray(appointmentManagement._id)
          ? appointmentManagement._id
          : [appointmentManagement._id];

        appointmentManagement._id = {
          $in: ids.map(id => new Types.ObjectId(id))
        };
      }

      if (appointmentManagement.startData && appointmentManagement.endDate) {
        appointmentManagement.createdAt = {
          $gte: new Date(appointmentManagement.startData),
          $lte: new Date(appointmentManagement.endDate),
        };
        delete appointmentManagement.startData;
        delete appointmentManagement.endDate;
      }
      const result = await this.appointmentManagementService.find(
        appointmentManagement,
      );
      console.log(result, appointmentManagement, "resultl")
      return result;
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message,
      };
    }
  }


  @Post('checkAvailableSlot')
  async checkAvailableSlot(@Request() req: Request,
    @Body('data') data: any) {
    console.log('Request Body:', req.body);
    console.log('Encrypted Data Received:', data);

    if (!data) {
      throw new Error('Encrypted data is missing');
    }

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    // console.log(decodedData, 'decodedDatallllllllll');
    const appointmentData = JSON.parse(decodedData);
    const newData = await this.appointmentManagementService.checkAvailableSlot(appointmentData);
    console.log(newData,"newData")
    return newData
  }

    @Post('employeeAvailableSlot')
  employeeAvailableSlot(@Request() req: Request,
    @Body('data') data: any) {
    console.log('Request Body:', req.body);
    console.log('Encrypted Data Received:', data);

    if (!data) {
      throw new Error('Encrypted data is missing');
    }

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    console.log(decodedData, 'decodedData');
    const appointmentData = JSON.parse(decodedData);
    return this.appointmentManagementService.employeeAvailableSlot(appointmentData);
  }

  @Post('unAvailableSlotsInDate')
  unAvailableSlotsInDate(@Request() req: Request,
    @Body('data') data: any) {
    console.log('Request Body:', req.body);
    console.log('Encrypted Data Received:', data);

    if (!data) {
      throw new Error('Encrypted data is missing');
    }

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    console.log(decodedData, 'decodedData');
    const appointmentData = JSON.parse(decodedData);
    return this.appointmentManagementService.unAvailableSlotsInDate(appointmentData);
  }

  @Post('getUnavailableDatesInMonth')
  async getUnavailableDatesInMonth(
    @Request() req: Request,
    @Body('data') data: string,
  ) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const data1 = JSON.parse(decodedData);
      const result = await this.appointmentManagementService.getUnavailableDatesInMonth(
        // { serviceId, employeeId, date, userId },
        data1
      );

      return {
        message: 'Unavailable dates fetched successfully',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error while fetching unavailable dates',
        statusCode: 400,
        error: error.message,
      };
    }
  }



  @Post('appointmentPayment')
  appointmentPayment(@Request() req: Request,
    @Body('data') data: any) {
    console.log('Request Body:', req.body);
    console.log('Encrypted Data Received:', data);

    if (!data) {
      throw new Error('Encrypted data is missing');
    }

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    console.log(decodedData, 'decodedData');
    const appointmentData = JSON.parse(decodedData);
    return this.appointmentManagementService.appointmentPayment(appointmentData);
  }

  @Get('paymentSuccess/:id')
  async payment(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Received ID: ${id}`);
      const redirectUrl = await this.appointmentManagementService.paymentSuccess(id);
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

  @Get('adminPaymentSuccess/:id')
  async adminPaymentSuccess(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Received ID: ${id}`);
      const redirectUrl = await this.appointmentManagementService.adminPaymentSuccess(id);
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

   @Get('paymentSuccessByAdmin/:id')
  async paymentSuccessByAdmin(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Received ID: ${id}`);
      const redirectUrl = await this.appointmentManagementService.paymentSuccessByAdmin(id);
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

  @Post('findByUser')
  async findByUser(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const { _id, status } = JSON.parse(decodedData);

      if (!_id) {
        throw new Error('User _id is required');
      }

      const filter = { userId: new Types.ObjectId(_id), };
      const today = moment().startOf('day').toDate();
      if (status == 'upcoming') {
        filter['date'] = { '$gte': today }
        filter['status'] = { $nin: ['notPaid'] }
      }else if (status == 'all') {
      
      }else {
        filter['status'] = status
      }
      console.log(filter, "fil")
      const result = await this.appointmentManagementService.findByUser(filter);

      return {
        message: 'Appointments fetched successfully',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error while fetching appointments',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('editAppointments')
  async editAppointments(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const editData = JSON.parse(decodedData);

      if (!editData._id) {
        throw new Error('Appointment _id is required');
      }
      if(editData.employeeId){
      editData.employeeId = new Types.ObjectId(
        editData.employeeId,
      );}
      if(editData.serviceId){
      editData.serviceId = new Types.ObjectId(
        editData.serviceId,
      );}
      if(editData.userId){
      editData.userId = new Types.ObjectId(
        editData.userId,
      );}
      
      // if(editData.apptStatus){
      //   editData
      // }
      const result = await this.appointmentManagementService.editAppointments(editData);

      return {
        message: 'Appointment edit successfully',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error while fetching appointments',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('employeeNonWorkingDates')
  async employeeNonWorkingDates(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);

      if (!Array.isArray(payload.slotsPayload) || payload.slotsPayload.length === 0) {
        throw new Error('slotsPayload must be a non-empty array');
      }

      const result = await this.appointmentManagementService.employeeNonWorkingDates(payload.slotsPayload);

      return {
        message: 'employeeNonWorkingDates fetch successfully',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error while fetching employeeNonWorkingDates',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('deleteBreak')
  async deleteBreak(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const { _id } = JSON.parse(decodedData);

      if (!_id) {
        throw new Error('Break _id is required');
      }

      const result = await this.appointmentManagementService.deleteBreak(_id);

      if (result.deletedCount === 0) {
        return {
          message: 'No break found with the given id',
          statusCode: 404,
        };
      }

      return {
        message: 'Break deleted successfully',
        statusCode: 200,
      };
    } catch (error) {
      return {
        message: 'Error while deleting break',
        statusCode: 400,
        error: error.message,
      };
    }
  }


  @Post('addBreak')
  async addBreak(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData)
      const result = await this.appointmentManagementService.addBreak(payload);

      if (result['statusCode'] == 204) {
        return result;
      } else {
        return {
          message: 'Break added successfully',
          statusCode: 200,
          data: result,
        };
      }
    } catch (error) {
      return {
        message: 'Error while adding break',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('editBreak')
  async editBreak(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const editData = JSON.parse(decodedData);

      if (!editData._id) {
        throw new Error('Break _id is required');
      }

      editData._id = new Types.ObjectId(editData._id);
      editData.employeeId = new Types.ObjectId(editData.employeeId);
      editData.userId = new Types.ObjectId(editData.userId);

      const result = await this.appointmentManagementService.editBreak(editData);

      if (!result) {
        return {
          message: 'No break found with the given id',
          statusCode: 404,
        };
      }

      return {
        message: 'Break updated successfully',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error while editing break',
        statusCode: 400,
        error: error.message,
      };
    }
  }

   @Post('editBreakFromAdmin')
  async editBreakFromAdmin(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const editData = JSON.parse(decodedData);

      if (!editData._id) {
        throw new Error('Break _id is required');
      }

      editData._id = new Types.ObjectId(editData._id);
      editData.employeeId = new Types.ObjectId(editData.employeeId);
      editData.userId = new Types.ObjectId(editData.userId);
      const breakId= new Types.ObjectId(editData._id);

      const result = await this.appointmentManagementService.editBreakFromAdmin(breakId,editData);

      if (!result) {
        return {
          message: 'No break found with the given id',
          statusCode: 404,
        };
      }

      return result
    } catch (error) {
      return {
        message: 'Error while editing break',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('sendKey')
  async sendKey(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const editData = JSON.parse(decodedData);

      if (!editData._id) {
        throw new Error('_id is required');
      }


      const result = await this.appointmentManagementService.sendKey(editData);

      if (!result) {
        return {
          message: 'Not found with the given id',
          statusCode: 404,
        };
      }

      return {
        message: 'Break updated successfully',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error while editing break',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  // appointment_management.controller.ts

  @Post('analytics')
  async getRevenueAnalytics(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const { employeeId } = JSON.parse(decodedData);

      const result = await this.appointmentManagementService.getRevenueAnalytics(employeeId);

      return {
        message: 'Analytics fetched successfully',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error while fetching analytics',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  // appointment_management.controller.ts
  @Post('summary')
  async getEmployeeSummary(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const { employeeId } = JSON.parse(decodedData);

      const summary = await this.appointmentManagementService.getEmployeeSummary(employeeId);

      return {
        message: 'Summary fetched successfully',
        statusCode: 200,
        data: summary,
      };
    } catch (error) {
      return {
        message: 'Error while fetching summary',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  // File: appointment_management.controller.ts

  @Post('nextAppointments')
  async getNextAppointments(@Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);

      const employeeId = result.employeeId;
      if (!employeeId) throw new Error('Employee ID is required');

      return await this.appointmentManagementService.getNextAppointments(employeeId);
    } catch (error) {
      return {
        message: 'Error fetching next appointments',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('employee-services')
  async getServicesByEmployee(@Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);

      const { employeeId } = parsed;
      if (!employeeId) throw new Error('employeeId is required');

      return await this.appointmentManagementService.getServicesByEmployee(employeeId);
    } catch (error) {
      console.error('Error fetching employee services:', error);
      return {
        message: 'Failed to fetch employee services',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  // File: appointment_management.controller.ts

  @Post('cancel')
  async cancelAppointment(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const { appointmentId, userId } = JSON.parse(decodedData);

      if (!appointmentId) throw new Error('appointmentId is required');

      const result = await this.appointmentManagementService.cancelAppointment(
        appointmentId,
        userId,
      );

      return result;
    } catch (error) {
      return {
        message: 'Error while cancelling appointment',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('takePayment')
  async takePayment(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const { appointmentId,paymentBy } = JSON.parse(decodedData);

      if (!appointmentId) throw new Error('appointmentId is required');
      

      const result = await this.appointmentManagementService.takePayment(appointmentId,paymentBy);

      return result;
    } catch (error) {
      return {
        message: 'Error while take payment',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('addBreakFromAdmin')
  async addBreakFromAdmin(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData)
      const result = await this.appointmentManagementService.addBreakFromAdmin(payload);

      if (result['statusCode'] == 204) {
        return result;
      } else {
        return result
        // {
        //   message: 'Break added successfully',
        //   statusCode: 200,
        //   data: result,
        // };
      }
    } catch (error) {
      return {
        message: 'Error while adding break',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('checkAvailableNonWorkingHourSlot')
  async checkAvailableNonWorkingHourSlot(@Request() req: Request,
    @Body('data') data: any) {
    console.log('Request Body:', req.body);
    console.log('Encrypted Data Received:', data);

    if (!data) {
      throw new Error('Encrypted data is missing');
    }

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    // console.log(decodedData, 'decodedDatallllllllll');
    const appointmentData = JSON.parse(decodedData);
    const newData = await this.appointmentManagementService.checkAvailableNonWorkingHourSlot(appointmentData);
    console.log(newData,"newData")
    return newData
  }

  @Post('appointmentAddToCart')
  async appointmentAddToCart(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const { appointmentId, userId } = JSON.parse(decodedData);

      if (!appointmentId) throw new Error('appointmentId is required');

      const result = await this.appointmentManagementService.appointmentAddToCart(
        appointmentId,
        userId,
      );

      return result;
    } catch (error) {
      return {
        message: 'Error while appointment add to cart',
        statusCode: 400,
        error: error.message,
      };
    }
  }
}
