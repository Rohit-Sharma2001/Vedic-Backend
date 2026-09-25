import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
import * as moment from 'moment';
import { Response } from 'express';
import * as XLSX from 'xlsx';



import { Coupon, CouponDocument, orderManagement, OrderDocument, EventBooking, EventBookingDocument, AppointmentManagement, AppointmentManagementDocument } from '../../schema/schema';

@Injectable()
export class CouponService {
  constructor(@InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(orderManagement.name) private orderModel: Model<OrderDocument>,
    @InjectModel(EventBooking.name) private eventBookingModel: Model<EventBookingDocument>,
    @InjectModel(AppointmentManagement.name) private appointmentModel: Model<AppointmentManagementDocument>
  ) { }

  async create1(couponData: Partial<Coupon>): Promise<Coupon> {
    const createdCoupon = new this.couponModel(couponData);
    // console.log(createdCoupon,"createdCouponcreatedCoupon",Product)
    return createdCoupon.save();
  }

  async findAll(
    page: number,
    pageSize: number,
    title?: string,
    startDateTime?: any | null,
    expiryDate?: any | null
  ) {
    const skip = (page - 1) * pageSize; // Calculate how many documents to skip
    const limit = pageSize;

    // Build the filter query
    const filter: any = {};

    // Filter by title or coupon code
    if (title) {
      const regex = new RegExp(title, 'i'); // Case-insensitive regex
      filter.$or = [
        { title: regex },
        { coupanCode: regex },
      ];
    }

    // Filter by startDateTime (if provided)
    if (startDateTime) {
      filter.startDateTime = { $gte: new Date(startDateTime) };
    }

    // Filter by expiryDate (if provided)
    if (expiryDate) {
      filter.expiryDate = { $lte: new Date(expiryDate) };
    }

    // Fetch coupons with pagination and filtering
    const coupons = await this.couponModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get the total count of filtered coupons (for pagination metadata)
    const totalCount = await this.couponModel.countDocuments(filter).exec();

    // Return the coupons and pagination metadata
    return {
      message: 'Coupons successfully fetched!',
      statusCode: 200,
      coupons,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }


  async findOneById(id: string): Promise<any> {  // Return type is updated to 'any' for more flexible response
    try {
      // Convert the ID to ObjectId (assuming it's already validated in the controller)
      const objectId = new Types.ObjectId(id);

      // Find the product by ObjectId
      const coupon = await this.couponModel.findOne({ _id: objectId }).exec();

      if (!coupon) {
        throw new Error(`coupon not found with id: ${id}`);
      }

      // Return the coupon along with a success message
      return {
        message: 'coupon successfully fetched!',
        statusCode: 201,
        coupon,
      };
    } catch (error) {
      console.error('Error fetching coupon:', error);

      // Return an error response if the coupon is not found or there is any other error
      return {
        message: 'An error occurred while fetching the coupon',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async updateProduct(id: any, couponUpdates: Partial<Coupon>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id, "AAAAAAAAAAAAAAAAAAA", couponUpdates)
      const objectId = new Types.ObjectId(id);
      couponUpdates.modified = new Date();
      const updatedProduct = await this.couponModel.updateOne(
        { _id: objectId },
        { $set: couponUpdates }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the updated document and validate schema
      );

      if (!updatedProduct) {
        return {
          message: 'Product not found with the provided id',
          statusCode: 404,
          error: `No product found with id: ${id}`,
        };
      }

      // Return success message with updated product
      return {
        message: 'Product successfully updated!',
        statusCode: 201,
        updatedProduct,
      };
    } catch (error) {
      console.error('Error updating product in the database:', error);

      // Return error response
      return {
        message: 'An error occurred while updating the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  async deleteCoupon(id: any) {
    // The update query
    console.log(id, "uiui")
    const updatedUser = await this.couponModel.deleteOne(
      { _id: new ObjectId(id) },
      // data, // Return the updated document
    );
    console.log(updatedUser, "updatedUser")
    return {
      message: 'File deleted successfully',
      // filePath: file.path,
    };
  }


  async applyCouponByCode(couponCode: string, userId: string): Promise<any> {
    try {
      const today = moment().startOf('day').toDate(); // Get today's date at 00:00:00

      const coupon = await this.couponModel.aggregate([
        {
          $match: {
            couponCode: couponCode,
            status: 1, // Active coupons only
            is_deleted: 0, // Not deleted
            $or: [
              { expiryDate: null }, // If expiryDate is null, it's valid
              { expiryDate: { $gte: today } } // If expiryDate exists, it must be today or in the future
            ]
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            couponCode: 1,
            discountType: 1,
            discountValue: 1,
            thresholdAmount: 1,
            maxDiscount: 1,
            totalUserLimit: 1,
            perUserLimit: 1,
            startDateTime: 1,
            expiryDate: 1,
            applicableTo: 1,
            description: 1,
            customerType: 1
          }
        }
      ]);
      if (!coupon.length) {
        return {
          message: 'Coupon not found or expired',
          statusCode: 404,
        };
      }

      const foundCoupon = coupon[0];

      // Enforce "new users only" restriction (but don't skip other validations)
      if (foundCoupon.customerType === 'new') {
        const previousPaidOrdersCount = await this.orderModel.countDocuments({
          userId: new Types.ObjectId(userId),
          status: 'paid',
        });

        if (previousPaidOrdersCount > 0) {
          return {
            message: 'This coupon is for new users only. You already book orders.',
            statusCode: 400,
          };
        }
      }

      // Enforce total usage limit (across all users) if provided (> 0)
      const totalUserLimit = Number(foundCoupon.totalUserLimit);
      if (Number.isFinite(totalUserLimit) && totalUserLimit > 0) {
        const totalUsesCount = await this.orderModel.countDocuments({
          couponId: couponCode,
          status: 'paid',
        });

        if (totalUsesCount >= totalUserLimit) {
          return {
            message: 'Coupon usage limit reached.',
            statusCode: 400,
          };
        }
      }

      // Enforce per-user usage limit if provided (> 0)
      const perUserLimit = Number(foundCoupon.perUserLimit);
      if (Number.isFinite(perUserLimit) && perUserLimit > 0) {
        const perUserUsesCount = await this.orderModel.countDocuments({
          couponId: couponCode,
          userId: new Types.ObjectId(userId),
          status: 'paid',
        });

        if (perUserUsesCount >= perUserLimit) {
          return {
            message: 'You already used maximum limit of this coupon.',
            statusCode: 400,
          };
        }
      }


      return {
        message: 'Coupon successfully applied!',
        statusCode: 201,
        coupon: foundCoupon, // Aggregation returns an array, so we return the first element
      };

    } catch (error) {
      console.error('Error applying coupon:', error);
      return {
        message: 'An error occurred while applying the coupon',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async downloadCouponExcel(id: string, res: Response): Promise<any> {
  try {
    const objectId = new Types.ObjectId(id);

    // =========================
    // ✅ GET COUPON
    // =========================
    const coupon = await this.couponModel.findOne({ _id: objectId }).lean();

    if (!coupon) {
      return res.status(404).json({
        message: 'Coupon not found',
      });
    }

    // =========================
    // ✅ GET ORDERS (PRODUCT USE)
    // =========================
    const orders = await this.orderModel.find({
      couponId: coupon.couponCode,
      is_deleted: { $ne: 1 },
    }).lean();

    // =========================
    // ✅ GET EVENTS
    // =========================
    // const events = await this.eventBookingModel.find({
    //   coupanId: coupon.couponCode,
    // }).lean();
    const events = await this.eventBookingModel
  .find({ coupanId: coupon.couponCode })
  .populate('eventId', 'eventname') // 👈 join here
  .lean();

    // =========================
    // ✅ OPTIONAL: GET APPOINTMENTS
    // =========================
    let appointments: any[] = [];
    if (this.appointmentModel) {
      appointments = await this.appointmentModel.find({
        couponId: coupon.couponCode,
      }).lean();
    }

    // =========================
    // ✅ COMMON COUPON DATA
    // =========================
    const getCouponBase = () => ({
      'Title': coupon.title || 'N/A',
      'Coupon Code': coupon.couponCode || 'N/A',
      'Discount Type': coupon.discountType || 'N/A',
      'Discount Value': Number(coupon.discountValue || 0),
      'Max Discount': Number(coupon.maxDiscount || 0),
      'Expiry Type': coupon.expiryType || 'N/A',
      'Start Date': coupon.startDateTime
        ? new Date(coupon.startDateTime).toLocaleDateString()
        : 'N/A',
      'Expiry Date': coupon.expiryDate
        ? new Date(coupon.expiryDate).toLocaleDateString()
        : 'N/A',
      'User Limit': Number(coupon.totalUserLimit || 0),
    });

    // =========================
    // ✅ MERGE ALL DATA INTO ONE
    // =========================
    const combinedData = [
      // 🔹 PRODUCT (Orders)
      ...orders.map((o: any) => ({
        ...getCouponBase(),

        'Date Uses': o.created_at
          ? new Date(o.created_at).toLocaleString()
          : '',

        'Use Amount': Number(o.totalAmount || 0),
        'Service Category name where coupan used': 'Product',

        'Name of Service': o.orderItems?.length
          ? o.orderItems.map(item => item.productName).join(', ')
        : 'N/A',

      })),

      // 🔹 EVENTS
      ...events.map((e: any) => ({
        ...getCouponBase(),

        'Date Uses': e.created_at
          ? new Date(e.created_at).toLocaleString()
          : '',

        'Use Amount': Number(e.amount || 0),

        'Service Category name where coupan used': "Event",
        'Name of Service': e.eventId?.eventname || 'N/A'
      })),

      // 🔹 APPOINTMENTS (if exists)
      ...appointments.map((a: any) => ({
        ...getCouponBase(),

        'Date Uses': a.created_at
          ? new Date(a.created_at).toLocaleString()
          : '',

        'Use Amount': Number(a.amount || 0),
        'Service Category name where coupan used': "Appointment",
        'Name of Service': a.serviceName || 'N/A'
      })),
    ];

    // =========================
    // ✅ HANDLE EMPTY DATA
    // =========================
    if (combinedData.length === 0) {
      combinedData.push({
        ...getCouponBase(),
        'Date Uses': 'No usage found',
        'Use Amount': 0,
        'Service Category name where coupan used': 'N/A',
        'Name of Service': 'N/A',
      });
    }

    // =========================
    // ✅ CREATE EXCEL
    // =========================
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(combinedData);

    XLSX.utils.book_append_sheet(workbook, sheet, 'Coupon Usage');

    // Optional column widths
    sheet['!cols'] = [
      { wch: 25 }, // Title
      { wch: 20 }, // Coupon Code
      { wch: 18 }, // Discount Type
      { wch: 18 }, // Discount Value
      { wch: 18 }, // Max Discount
      { wch: 15 }, // Start Date
      { wch: 15 }, // Expiry Date
      { wch: 12 }, // User Limit
      { wch: 25 }, // Date Uses
      { wch: 15 }, // Use Amount
      { wch: 20 }, // Service Category name where coupan used
      { wch: 20 }, // Name of Service
    ];

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // =========================
    // ✅ RESPONSE HEADERS
    // =========================
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Coupon_${coupon.couponCode}.xlsx`
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader('Content-Length', buffer.length);

    res.end(buffer);

  } catch (error) {
    console.error('Excel Error:', error);

    return res.status(500).json({
      message: 'Failed to generate Excel',
      error: error.message,
    });
  }
}



}