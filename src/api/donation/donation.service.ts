// src/modules/donation/donation.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Donation, DonationDocument, User, UserDocument } from 'src/schema/schema';
import Stripe from 'stripe';
import * as moment from 'moment';

@Injectable()
export class DonationService {
  private stripe: Stripe;
  constructor(
    @InjectModel(Donation.name) private donationModel: Model<DonationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // apiVersion: '2023-10-16',
    });
  }

  async createPaymentLink(data: Partial<any>) {
    const currency = 'usd';
    const amount = parseFloat(data.amount) || 0;
    
    if (amount <= 0) {
      throw new Error('Donation amount must be greater than 0');
    }

    const saveData = {
      user_id: new Types.ObjectId(data.user_id),
      amount: amount,
      status: 'notPaid',
      description: data.description || '',
      message: data.message || '',
      created_date: new Date(),
      modified_date: new Date(),
      date: new Date(),
    };

    const donation = new this.donationModel(saveData);
    const newDonation = await donation.save();

    const payableAmount = parseFloat((amount * 100).toFixed(2));
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Donation',
              description: data.description || 'Thank you for your donation',
            },
            unit_amount: payableAmount,
          },
          quantity: 1,
        },
      ],
       payment_intent_data: {
       description: "Donation",
       metadata: {
            id: `${data.user_id}`,
            type:'donation'
          }},
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/donation/paymentSuccess/${newDonation._id}`,
    });

    await this.donationModel.findByIdAndUpdate(
      { _id: newDonation._id },
      { $set: { paymentSessionId: session.id || '' } },
    );

    return {
      message: 'Donation payment link created',
      statusCode: 200,
      paymentUrl: session.url,
      orderId: newDonation._id,
    };
  }

  async paymentSuccess(id: string) {
    try {
      const donationData = await this.donationModel.findById(id);

      if (!donationData) {
        return {
          message: 'Donation not found',
          statusCode: 400,
        };
      } else if (donationData?.status === 'paid') {
        return {
          message: 'Donation already processed',
          statusCode: 400,
        };
      }

      await this.donationModel.findByIdAndUpdate(
        { _id: id },
        { $set: { status: 'paid', modified_date: new Date() } },
      );

      return {
        message: 'Donation processed successfully',
        statusCode: 200,
        paymentUrl: `${process.env.FRONTEND_URL}/Donation/Thankyou/${id}`,
      };
    } catch (error) {
      console.log(error, 'eeeeeeeeee');
      // throw new Error(error.message);
      return {
                    message: 'Something went wromg',
                    statusCode: 400,
                    error:error.message
                };
    }
  }

  async donationHistory(page: number, pageSize: number, user_id?: string) {
    try {
      const skip = (page - 1) * pageSize;
      const limit = pageSize;
      const match: any = {};
      
      if (user_id) {
        match['user_id'] = new Types.ObjectId(user_id);
      }

      const donationData = await this.donationModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $sort: {
            date: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      const totalCount = await this.donationModel.countDocuments(match);

      if (!donationData.length) {
        return {
          message: 'No donations found',
          statusCode: 200,
          donationData: [],
          totalCount: 0,
          page,
          pageSize,
          totalPages: 0,
        };
      }

      return {
        message: 'Donations fetched successfully',
        statusCode: 200,
        donationData,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error) {
      console.log(error, 'eeeeeeeeee');
      throw new Error(error.message);
    }
  }

  async getDonationById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid donation ID',
          statusCode: 400,
        };
      }

      const donation = await this.donationModel
        .findById(id)
        .populate({
          path: 'user_id',
          model: 'User',
          select: 'name email mobileNo',
        })
        .lean();

      if (!donation) {
        return {
          message: 'Donation not found',
          statusCode: 404,
        };
      }

      return {
        message: 'Donation fetched successfully',
        statusCode: 200,
        result: donation,
      };
    } catch (error) {
      console.error('Error fetching donation:', error);
      return {
        message: 'Failed to fetch donation',
        statusCode: 500,
        error: error.message,
      };
    }
  }
}

