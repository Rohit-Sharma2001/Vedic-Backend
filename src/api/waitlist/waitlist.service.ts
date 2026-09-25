import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, WaitlistManagement, WaitlistManagementDocument, ServicesManagement, ServicesManagementDocument, Employee, EmployeeDocument } from '../../schema/schema';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
import axios from 'axios';
import { sendOtpEmail, sendOtpForPassword, sendWaitlistConfirmationMail } from '../../middlewares/nodemailer/nodemailer.controller';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectModel(WaitlistManagement.name) private WaitlistModel: Model<WaitlistManagementDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(ServicesManagement.name) private serviceModel: Model<ServicesManagementDocument>,
  ) { }
  async create(waitlistData: Partial<any>): Promise<any> {
    try {
      const { data } = waitlistData;

      if (!data || !Array.isArray(data.waitlistData) || data.waitlistData.length === 0) {
        return { status: false, message: "No waitlist data provided." };
      }

      const formattedData = data.waitlistData.map(e => ({
        ...e,
        serviceId: new Types.ObjectId(e.serviceId),
        employeeId: new Types.ObjectId(e.employeeId),
        userId: new Types.ObjectId(e.userId),
        ...(e.familyMemberId ? { familyMemberId: new Types.ObjectId(e.familyMemberId) } : {}),
      }));
      const userData = await this.userModel.findById(new Types.ObjectId(data.waitlistData[0].userId))
      const serviceData = await this.serviceModel.findById(new Types.ObjectId(data.waitlistData[0].serviceId))
      const employeeData = await this.employeeModel.aggregate([{ $match: { _id: new Types.ObjectId(data.waitlistData[0].employeeId) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      ])
      await this.WaitlistModel.insertMany(formattedData);
       const [year, month, day] = data.waitlistData[0].date.split("T")[0].split("-");

  const d = new Date(year, month - 1, day); // local date (no shift)

  const date =  d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
      await sendWaitlistConfirmationMail(userData.email, `${userData.name} ${userData.lastName||""}`, serviceData.name,`${employeeData[0].user.name} ${employeeData[0].user.lastName||""}`,date)
      
      return { status: true, message: "Waitlist added successfully." };

    } catch (error: any) {
      console.error("Error creating waitlist:", error);
      return {
        status: false,
        message: "An error occurred while creating the waitlist data.",
        error: error.message || error,
      };
    }
  }
  async getByUserId(userId: string): Promise<any> {
    try {
      // waitlist.service.ts

      const entries = await this.WaitlistModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },

        // ✅ NEW: family member details (only if familyMemberId exists)
        {
          $lookup: {
            from: 'userfamilies',          // ⚠️ confirm actual collection name
            localField: 'familyMemberId',
            foreignField: '_id',
            as: 'familyMember',
          },
        },
        { $unwind: { path: '$familyMember', preserveNullAndEmptyArrays: true } },

        // existing lookups...
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $lookup: {
            from: 'employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'employee.userId',
            foreignField: '_id',
            as: 'employee.userDetails',
          },
        },
        { $unwind: { path: '$employee.userDetails', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'servicesmanagements',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'service',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
      ]);


      if (!entries || entries.length === 0) {
        return { status: false, message: 'No waitlist entries found for this user.' };
      }

      return { status: true, data: entries };
    } catch (error) {
      return {
        status: false,
        message: 'An error occurred while fetching waitlist entries.',
        error: error.message || error
      };
    }
  }

  async deleteById(waitlistId: string): Promise<any> {
    try {
      const deleted = await this.WaitlistModel.findByIdAndDelete(waitlistId);
      if (!deleted) {
        return { status: false, message: 'Waitlist entry not found.' };
      }
      return { status: true };
    } catch (error) {
      return {
        status: false,
        message: 'An error occurred while deleting the waitlist entry.',
        error: error.message || error
      };
    }
  }

  //  async fatchWaitlist(data: Partial<any>): Promise<any> {
  //   try {
  //      const entries = await this.WaitlistModel.aggregate([
  //       { $match: { userId: new Types.ObjectId(userId) } },

  //       // ✅ NEW: family member details (only if familyMemberId exists)
  //       {
  //         $lookup: {
  //           from: 'userfamilies',          // ⚠️ confirm actual collection name
  //           localField: 'familyMemberId',
  //           foreignField: '_id',
  //           as: 'familyMember',
  //         },
  //       },
  //       { $unwind: { path: '$familyMember', preserveNullAndEmptyArrays: true } },

  //       // existing lookups...
  //       {
  //         $lookup: {
  //           from: 'users',
  //           localField: 'userId',
  //           foreignField: '_id',
  //           as: 'user',
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'employees',
  //           localField: 'employeeId',
  //           foreignField: '_id',
  //           as: 'employee',
  //         },
  //       },
  //       { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
  //       {
  //         $lookup: {
  //           from: 'users',
  //           localField: 'employee.userId',
  //           foreignField: '_id',
  //           as: 'employee.userDetails',
  //         },
  //       },
  //       { $unwind: { path: '$employee.userDetails', preserveNullAndEmptyArrays: true } },
  //       {
  //         $lookup: {
  //           from: 'servicesmanagements',
  //           localField: 'serviceId',
  //           foreignField: '_id',
  //           as: 'service',
  //         },
  //       },
  //       { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
  //       { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
  //     ]);
  //     // if (!deleted) {
  //     //   return { status: false, message: 'Waitlist entry not found.' };
  //     // }
  //     return { status: true };
  //   } catch (error) {
  //     return {
  //       status: false,
  //       message: 'An error occurred while deleting the waitlist entry.',
  //       error: error.message || error
  //     };
  //   }
  // }

  async fatchWaitlist(data: any): Promise<any> {
  try {
    const { userId, search, date } = data;

    const pipeline: any[] = [
      // { $match: { userId: new Types.ObjectId(userId) } },

      // ✅ family member
      {
        $lookup: {
          from: 'userfamilies',
          localField: 'familyMemberId',
          foreignField: '_id',
          as: 'familyMember',
        },
      },
      { $unwind: { path: '$familyMember', preserveNullAndEmptyArrays: true } },

      // ✅ user
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

      // ✅ employee
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'users',
          localField: 'employee.userId',
          foreignField: '_id',
          as: 'employeeUser',
        },
      },
      { $unwind: { path: '$employeeUser', preserveNullAndEmptyArrays: true } },

      // ✅ service
      {
        $lookup: {
          from: 'servicesmanagements',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
    ];

    // 🔍 SEARCH FILTER
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");

      pipeline.push({
        $match: {
          $or: [
            { "service.category.name": regex },
            { "user.name": regex },
            { "user.lastName": regex },
            { "user.email": regex },
            { "familyMember.firstName": regex },
            { "familyMember.lastName": regex },
            { "employeeUser.name": regex },
            { "employeeUser.lastName": regex },
          ]
        }
      });
    }

    // 📅 DATE FILTER
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      pipeline.push({
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      });
    }
console.log(pipeline)
    const entries = await this.WaitlistModel.aggregate(pipeline);

    return {
      status: true,
      data: entries
    };

  } catch (error) {
    return {
      status: false,
      message: 'Error fetching waitlist',
      error: error.message || error
    };
  }
}
}

