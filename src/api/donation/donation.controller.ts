// src/modules/donation/donation.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  Param,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { DonationService } from './donation.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Response } from 'express';
import { Types } from 'mongoose';

@Controller('donation')
@UseInterceptors(Base64Interceptor)
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @Post('paymentLink')
  async createPaymentLink(
    @Request() req: Request,
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);

      result.created_date = new Date();
      result.modified_date = new Date();

      const created = await this.donationService.createPaymentLink(result);

      return {
        message: 'Donation payment link created successfully!',
        statusCode: 201,
        data: created,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Failed to create donation payment link',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Get('paymentSuccess/:id')
  async paymentSuccess(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Received ID: ${id}`);
      const redirectUrl = await this.donationService.paymentSuccess(id);
      console.log(redirectUrl, 'redirectUrl');
      
      if (redirectUrl.statusCode == 200) {
        if (!redirectUrl || typeof redirectUrl !== 'object') {
          throw new Error('Invalid redirect URL');
        }
        res.redirect(302, redirectUrl.paymentUrl);
      } else {
        return res.status(500).json(redirectUrl);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      return res.status(500).json({
        message: 'An error occurred while processing the payment',
        statusCode: 500,
        error: error.message,
      });
    }
  }

  @Post('donation_transactions')
  async donationHistory(
    @Request() req: Request,
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);
      const page = result['page'] || 1;
      const pageSize = result['pageSize'] || 10;
      const user_id = result['user_id'] || null;

      const history = await this.donationService.donationHistory(page, pageSize, user_id);

      return {
        message: 'Donation history fetched successfully!',
        statusCode: 200,
        data: history,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Failed to fetch donation history',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('view')
  async getDonationById(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);
      const id = result.id;

      if (!Types.ObjectId.isValid(id)) {
        return { message: 'Invalid ObjectId', statusCode: 400 };
      }

      return await this.donationService.getDonationById(id);
    } catch (error) {
      return {
        message: 'Error fetching donation',
        statusCode: 500,
        error: error.message,
      };
    }
  }
}

