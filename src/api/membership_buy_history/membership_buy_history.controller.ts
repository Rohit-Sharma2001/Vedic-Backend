// src/modules/membership_management/membership_management.controller.ts
import {
  Controller,
  Post, Res,
  Get,
  Body,
  UploadedFiles,
  Request,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { MembershipBuyHistroyService } from './membership_buy_history.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Express, Response } from 'express';
import { Types } from 'mongoose';

@Controller('membership_buy_management')
@UseInterceptors(Base64Interceptor)
export class MembershipBuyHistroyController {
  constructor(private readonly membershipBuyService: MembershipBuyHistroyService) { }

  @Post('paymentLink')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);

      // if (files.image && files.image[0]) {
      //   result['image'] = files.image[0].path;
      // }

      result.created_date = new Date();
      result.modified_date = new Date();

      const created = await this.membershipBuyService.createPaymentLink(result);

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

  // Create a payment link specifically for renewing an existing membership
  @Post('renew')
  async renew(
    @Request() req: Request,
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);

      result.created_date = new Date();
      result.modified_date = new Date();

      const created = await this.membershipBuyService.createPaymentLink(result);

      return {
        message: 'Membership renewal initiated!',
        statusCode: 201,
        data: created,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Failed to renew membership',
        statusCode: 400,
        error: error.message,
      };
    }
  }


  @Get('paymentSuccess/:id')
  async payment(@Param('id') id: string, @Res() res: Response) {
    try {
      console.log(`Received ID: ${id}`);
      const redirectUrl = await this.membershipBuyService.paymentSuccess(id);
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

@Post('membership_transactions')
async history(@Request() req: Request, @Body('data') data: string) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result = JSON.parse(decodedData);

    const page = Number(result['page'] || 1);
    const pageSize = Number(result['pageSize'] || 10);
    const user_id = result['user_id'] || null;
    const membership_id=result['membership_id']||null

    const created = await this.membershipBuyService.paymentHistory(page, pageSize, user_id,membership_id);

    return {
      message: 'Membership history fetched successfully!',
      statusCode: 200,
      ...created, // includes membershipData + pagination
    };
  } catch (error) {
    return {
      message: 'Failed to fetch membership buy history',
      statusCode: 400,
      error: error.message,
    };
  }
}

  @Post('getUserSubscriptionDetails')
  async getUserSubscriptionDetails(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result = JSON.parse(decodedData);
      const user_id = result['_id'] || result['user_id'];

      if (!user_id) {
        return {
          message: 'User ID is required',
          statusCode: 400,
        };
      }

      return await this.membershipBuyService.getUserSubscriptionDetails(user_id);
    } catch (error) {
      console.error('Error fetching user subscription details:', error);
      return {
        message: 'Failed to fetch user subscription details',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('upgradePlan')
async upgradePlan(
  @Request() req: Request,
  @Body('data') data: string,
) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result = JSON.parse(decodedData);

    const { user_id, new_plan_id } = result;

    if (!user_id || !new_plan_id) {
      return { statusCode: 400, message: 'user_id & new_plan_id are required' };
    }

    const response = await this.membershipBuyService.upgradePlan(user_id, new_plan_id);

    return {
      message: 'Upgrade payment link created',
      statusCode: 200,
      data: response,
    };
  } catch (error) {
    console.log("error:",error)
    return {
      statusCode: 500,
      message: 'Failed to create upgrade payment link',
      error: error.message,
    };
  }
}

 @Post('cancelMemberShip')
async cancelMemberShip(
  @Request() req: Request,
  @Body('data') data: string,
) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result = JSON.parse(decodedData);

    const { user_id, plan_id } = result;

    if (!user_id || !plan_id) {
      return { statusCode: 400, message: 'user_id & plan_id are required' };
    }

    const response = await this.membershipBuyService.cancelMemberShip(user_id, plan_id);

    return {
      message: 'Upgrade payment link created',
      statusCode: 200,
      data: response,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Failed to create upgrade payment link',
      error: error.message,
    };
  }
}

 @Post('getMemberShipByPaymentId')
async getMemberShipByPaymentId(
  @Request() req: Request,
  @Body('data') data: string,
) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result = JSON.parse(decodedData);

    const { user_id, id } = result;

    if (!user_id || !id) {
      return { statusCode: 400, message: 'user_id & id are required' };
    }

    const response = await this.membershipBuyService.getMemberShipByPaymentId(id,user_id );

    return {
      message: 'Upgrade payment link created',
      statusCode: 200,
      data: response,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: 'Failed to create upgrade payment link',
      error: error.message,
    };
  }
}

}