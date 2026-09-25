import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  smsOtp,
  smsOtpDocument,
  emailOtp,
  emailOtpDocument,
  address,
  addressDocument,
  MembershipBuyHistroy,
  MembershipBuyHistroyDocument,
  RoleTable,
  RoleTableDocument,
  RoleModuleService,
  RoleModuleServiceDocument
} from '../../schema/schema';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
import axios from 'axios';
import {
  sendOtpEmail,
  sendOtpForPassword,
  sendWelcomeEmail,
  sendLoginSuccessEmail,
  sendResetPasswordOtpEmail,
} from '../../middlewares/nodemailer/nodemailer.controller';
import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

@Injectable()
export class UserService {
  private stripe: Stripe;
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(emailOtp.name) private emailOtpModel: Model<emailOtpDocument>,
    @InjectModel(smsOtp.name) private smsOtpModel: Model<smsOtpDocument>,
    @InjectModel(address.name) private addressModel: Model<addressDocument>,
    @InjectModel(MembershipBuyHistroy.name) private membershipBuyModel: Model<MembershipBuyHistroyDocument>,
    @InjectModel(RoleTable.name) private RoleTableModel: Model<RoleTableDocument>,
    @InjectModel(RoleModuleService.name) private RoleModuleServiceModel: Model<RoleModuleServiceDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  private readonly hostUrl = 'http://localhost:3008';

  private withImageUrl<T extends { image?: string }>(obj: any): any {
    const imageUrl = obj?.image
      ? `${this.hostUrl}/${String(obj.image).replace(/\\/g, '/')}`
      : null;

    return { ...obj, imageUrl };
  }

  async create(userData: Partial<User>): Promise<any> {
    try {
      const { email, mobileNo, password } = userData;

      // Check if email already exists
      const existingEmail = await this.userModel.findOne({ email: email.trim().toLocaleLowerCase(), role: { $ne: "guest" } });
      if (existingEmail) {
        return { status: false, message: 'Email already registered.' };
      }

      // Check if mobile number already exists
      const existingMobile = await this.userModel.findOne({ mobileNo, role: { $ne: "guest" } });
      if (existingMobile) {
        return { status: false, message: 'Mobile number already registered.' };
      }
      const guestUser = await this.userModel.findOne({ email: email.trim().toLocaleLowerCase(), mobileNo, role: "guest" });
      const customerCount = await this.userModel.countDocuments();

      // Encrypt password
      const hashedPassword = await this.bcryptPassword(password);
      let createdUser
      if (guestUser) {
        const user = {
          ...guestUser.toObject(),
          email: email.trim().toLocaleLowerCase(),
          password: hashedPassword,
          date: new Date(),
          role: "member",
          modified: new Date(),
          vedicCustomerId: customerCount + 1
        };

        createdUser = await this.userModel.findOneAndUpdate({ _id: guestUser._id }, { $set: user });
      } else {

        const user = {
          ...userData,
          email: email.trim().toLocaleLowerCase(),
          password: hashedPassword,
          date: new Date(),
          modified: new Date(),
          vedicCustomerId: customerCount + 1
        };

        createdUser = await this.userModel.create(user); // new this.userModel(user);
        // await createdUser.save();

        const customer = await this.stripe.customers.create({
          email: user.email.trim().toLocaleLowerCase(),
          name: createdUser.name,
          metadata: { userId: createdUser._id.toString() },
        });
        createdUser.stripeCustomerId = customer.id;
        await createdUser.save();
      }
      // Send welcome email (non-blocking; registration succeeds even if email fails)
      try {
        await sendWelcomeEmail(createdUser.email, createdUser.name);
      } catch (emailErr) {
        console.error('Welcome email failed:', emailErr);
      }
      // Convert to plain object & remove password
      const userObj = createdUser.toObject();
      delete userObj.password;

      return { status: true, message: 'User Registered', user: userObj };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        status: false,
        message: 'An error occurred while creating the user.',
        error,
      };
    }
  }


  async createUser(userData: Partial<User>): Promise<any> {
    try {
      const { email, mobileNo, password, roleId } = userData;

      // Check if email already exists
      const existingEmail = await this.userModel.findOne({
        email: email.trim().toLowerCase(),
        role: { $ne: "guest" }
      });

      if (existingEmail) {
        return {
          status: false,
          message: 'Email already registered.'
        };
      }

      // Check mobile already exists
      const existingMobile = await this.userModel.findOne({
        mobileNo,
        role: { $ne: "guest" }
      });

      if (existingMobile) {
        return {
          status: false,
          message: 'Mobile number already registered.'
        };
      }

      // Find Role Data
      const roleData = await this.RoleTableModel.findById(roleId);

      if (!roleData) {
        return {
          status: false,
          message: 'Invalid Role ID'
        };
      }

      const customerCount =
        await this.userModel.countDocuments();

      // Encrypt password
      const hashedPassword =
        await this.bcryptPassword(password);

      // Final User Object
      const user = {
        ...userData,

        email: email.trim().toLowerCase(),

        password: hashedPassword,

        // SAVE ROLE ID
        roleId: new Types.ObjectId(
          roleId.toString(),
        ),

        // SAVE ROLE NAME
        role: "admin",

        date: new Date(),

        modified: new Date(),

        vedicCustomerId: customerCount + 1,
      };

      // Create User
      const createdUser =
        await this.userModel.create(user);

      // Stripe Customer
      const customer =
        await this.stripe.customers.create({
          email: user.email,
          name: createdUser.name,
          metadata: {
            userId: createdUser._id.toString(),
          },
        });

      createdUser.stripeCustomerId =
        customer.id;

      await createdUser.save();

      // Send Welcome Email
      try {
        await sendWelcomeEmail(
          createdUser.email,
          createdUser.name,
        );
      } catch (emailErr) {
        console.error(
          'Welcome email failed:',
          emailErr,
        );
      }

      // Remove Password
      const userObj = createdUser.toObject();

      delete userObj.password;

      return {
        status: true,
        message: 'User Registered',
        user: userObj,
      };

    } catch (error: any) {

      console.error(
        'Error creating user:',
        error,
      );

      return {
        status: false,
        message:
          'An error occurred while creating the user.',
        error,
      };
    }
  }

  async createUserByPractitionar(userData: Partial<User>): Promise<any> {
    try {
      let { email, mobileNo, password } = userData;
      password = password || 'vedichealth@123'
      // Check if email already exists
      const existingEmail = await this.userModel.findOne({ email: email.trim().toLocaleLowerCase() });
      if (existingEmail) {
        return { status: false, message: 'Email already registered.' };
      }

      // Check if mobile number already exists
      const existingMobile = await this.userModel.findOne({ mobileNo });
      if (existingMobile) {
        return { status: false, message: 'Mobile number already registered.' };
      }
      const customerCount = await this.userModel.countDocuments();

      // Encrypt password
      const hashedPassword = await this.bcryptPassword(password);
      const user = {
        ...userData,
        email: email.trim().toLocaleLowerCase(),
        password: hashedPassword,
        date: new Date(),
        modified: new Date(),
        vedicCustomerId: customerCount + 1
      };

      const createdUser = await this.userModel.create(user); // new this.userModel(user);
      // await createdUser.save();

      const customer = await this.stripe.customers.create({
        email: user.email.trim().toLocaleLowerCase(),
        name: createdUser.name,
        metadata: { userId: createdUser._id.toString() },
      });
      createdUser.stripeCustomerId = customer.id;
      await createdUser.save();
      // Send welcome email (non-blocking; registration succeeds even if email fails)
      try {
        await sendWelcomeEmail(createdUser.email, createdUser.name);
      } catch (emailErr) {
        console.error('Welcome email failed:', emailErr);
      }
      // Convert to plain object & remove password
      const userObj = createdUser.toObject();
      // delete userObj.password;
      const users = await this.userModel.aggregate([{ $match: { email: userObj.email.trim().toLocaleLowerCase() } }, {
        $lookup: {
          from: "addresses",
          localField: "_id",
          foreignField: "user_id",
          as: "address"
        }
      }, {
        $lookup: {
          from: "membershipbuyhistroys",
          localField: "_id",
          foreignField: "user_id",
          as: "membership"
        }
      }])

      return { status: true, message: 'User Registered', data: users };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        status: false,
        message: 'An error occurred while creating the user.',
        error,
      };
    }
  }

  // // using email is same to same case sensetive
  // async login(email: string, password: string): Promise<any> {
  //   try {
  //     const user = await this.userModel.findOne({ email });

  //     if (!user) {
  //       return { status: false, message: "User not found." };
  //     }

  //     const isPasswordValid = await this.decryptPassword(password, user.password);

  //     if (!isPasswordValid) {
  //       return { status: false, message: "Invalid email or password." };
  //     }

  //     return { status: true, message: "Login successful.", user };
  //   } catch (error) {
  //     console.error("Error in login:", error);
  //     return { status: false, message: "An error occurred while logging in." };
  //   }
  // }


  // using case-insensitive match




  // async login(email: string, password: string): Promise<any> {
  //   try {
  //     const normalizedEmail = email.trim().toLowerCase();

  //     const user = await this.userModel.findOne({ email: normalizedEmail, role: { $ne: "guest" } });
  //     if (!user) return { status: false, message: 'User not found.' };
  //     else if( user.is_deleted== 1)return { status: false, message: 'Your account is inactive. Please contact the Vedic support team.' };
  //     // const user = await this.userModel.findOne({
  //     //   email: { $regex: `^${email}$`, $options: 'i' }, // case-insensitive match
  //     // });

  //     // if (!user) {
  //     //   return { status: false, message: 'User not found.' };
  //     // }
  //     // Fetch latest paid & active membership
  //     const membership = await this.membershipBuyModel
  //       .findOne({
  //         user_id: user._id,
  //         status: "paid",
  //         is_expired: false
  //       })
  //       .sort({ date: -1 });

  //     const isPasswordValid = await this.decryptPassword(
  //       password,
  //       user.password,
  //     );

  //     if (!isPasswordValid) {
  //       return { status: false, message: 'Invalid email or password.' };
  //     }
  //     // Send login success email (non-blocking; login succeeds even if email fails)
  //     try {
  //       await sendLoginSuccessEmail(user.email, user.name);
  //     } catch (emailErr) {
  //       console.error('Login success email failed:', emailErr);
  //     }
  //     console.log(membership, 'membership');
  //     // let result = { ...user }
  //     const userObj = user.toObject();

  //     if (membership) {
  //       userObj['membershipId'] = membership.membership_id;
  //     }

  //     console.log(userObj, 'lllllllllll');
  //     return { status: true, message: 'Login successful.', user: userObj };
  //   } catch (error) {
  //     console.error('Error in login:', error);
  //     return { status: false, message: 'An error occurred while logging in.' };
  //   }
  // }

  async login(
    email: string,
    password: string,
  ): Promise<any> {

    try {

      const normalizedEmail =
        email.trim().toLowerCase();

      // =========================
      // GET USER WITH ROLE & MODULES
      // =========================

      const userData =
        await this.userModel.aggregate([

          {
            $match: {
              email: normalizedEmail,
              role: { $ne: 'guest' },
            },
          },

          // =========================
          // JOIN ROLE TABLE
          // =========================

          {
            $lookup: {
              from: 'role_table',
              localField: 'roleId',
              foreignField: '_id',
              as: 'roleData',
            },
          },

          {
            $unwind: {
              path: '$roleData',
              preserveNullAndEmptyArrays: true,
            },
          },

          // =========================
          // JOIN ROLE MODULE TABLE
          // =========================

          {
            $lookup: {
              from: 'role_module_table',
              localField: 'roleData.roleModuleIds',
              foreignField: '_id',
              as: 'modules',
            },
          },

          // =========================
          // FINAL RESPONSE
          // =========================

          {
            $project: {

              password: 1,
              name: 1,
              email: 1,
              mobileNo: 1,
              role: 1,
              roleId: 1,
              modified: 1,
              date: 1,
              is_deleted: 1,
              city: 1,
              state: 1,
              country: 1,
              address1: 1,
              address2: 1,
              zipcode: 1,
              gender: 1,
              lastName: 1,
              dob: 1,
              vedicCustomerId: 1,

              roleData: {
                _id: '$roleData._id',
                roleName: '$roleData.roleName',
                hierarchy: '$roleData.hierarchy',
              },

              modules: {
                $map: {
                  input: '$modules',
                  as: 'module',
                  in: {
                    _id: '$$module._id',
                    moduleName: '$$module.moduleName',
                    parent_id: '$$module.parent_id',
                    parent_management:
                      '$$module.parent_management',
                    status: '$$module.status',
                  },
                },
              },
            },
          },

        ]);

      // =========================
      // USER NOT FOUND
      // =========================

      if (!userData.length) {

        return {
          status: false,
          message: 'User not found.',
        };
      }

      const user = userData[0];

      // =========================
      // ACCOUNT INACTIVE
      // =========================

      if (user.is_deleted == 1) {

        return {
          status: false,
          message:
            'Your account is inactive. Please contact the Vedic support team at info@vedichealth.org.',
        };
      }

      // =========================
      // PASSWORD CHECK
      // =========================

      const isPasswordValid =
        await this.decryptPassword(
          password,
          user.password,
        );

      if (!isPasswordValid) {

        return {
          status: false,
          message:
            'Invalid email or password.',
        };
      }

      // =========================
      // MEMBERSHIP
      // =========================

      const membership =
        await this.membershipBuyModel.findOne({
          user_id: user._id,
          status: 'paid',
          is_expired: false,
        }).sort({ date: -1 });

      // =========================
      // REMOVE PASSWORD
      // =========================

      delete user.password;

      // =========================
      // MEMBERSHIP ID
      // =========================

      if (membership) {

        user['membershipId'] =
          membership.membership_id;
      }

      // =========================
      // LOGIN EMAIL
      // =========================

      try {

        await sendLoginSuccessEmail(
          user.email,
          user.name,
        );

      } catch (emailErr) {

        console.error(
          'Login success email failed:',
          emailErr,
        );
      }

      // =========================
      // FINAL RESPONSE
      // =========================

      return {

        status: true,
        message: 'Login successful.',
        user,
      };

    } catch (error) {

      console.error(
        'Error in login:',
        error,
      );

      return {
        status: false,
        message:
          'An error occurred while logging in.',
      };
    }
  }

  async findMembers(): Promise<User[]> {
    return this.userModel.find({ role: 'member', is_deleted: 0 }).exec();
  }

  async updateUser(
    userId: string,
    updateUserData: Partial<User>,
  ): Promise<User | null> {

    // ✅ fetch current user (so we can compare old vs new)
    const existingUser = await this.userModel.findById(userId);
    if (!existingUser) return null;

    // ✅ normalize incoming values
    const nextEmail =
      typeof updateUserData.email === "string"
        ? updateUserData.email.trim().toLowerCase()
        : undefined;

    const nextMobile =
      updateUserData.mobileNo !== undefined && updateUserData.mobileNo !== null
        ? String(updateUserData.mobileNo).replace(/[^0-9]/g, "") // digits only
        : undefined;

    // ✅ Email uniqueness (only if email is being updated & changed)
    if (nextEmail && nextEmail !== existingUser.email) {
      const emailExists = await this.userModel.findOne({
        email: nextEmail,
        _id: { $ne: new Types.ObjectId(userId) },
      });
      if (emailExists) {
        // throw structured error for controller
        throw new Error("DUPLICATE_EMAIL");
      }
      // store normalized email back
      updateUserData.email = nextEmail as any;
    }

    // ✅ Mobile uniqueness (only if mobileNo is being updated & changed)
    if (nextMobile && String(existingUser.mobileNo) !== nextMobile) {
      const mobileExists = await this.userModel.findOne({
        mobileNo: Number(nextMobile),
        _id: { $ne: new Types.ObjectId(userId) },
      });
      if (mobileExists) {
        throw new Error("DUPLICATE_MOBILE");
      }
      updateUserData.mobileNo = Number(nextMobile) as any;
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { ...updateUserData, modified: new Date() } },
      { new: true },
    );

    return updatedUser;
  }


  async editVedicUser(
    userId: string,
    updateUserData: Partial<User>,
  ): Promise<User | null> {

    // Existing User
    const existingUser =
      await this.userModel.findById(userId);

    if (!existingUser) return null;

    // Normalize Email
    const nextEmail =
      typeof updateUserData.email === "string"
        ? updateUserData.email
          .trim()
          .toLowerCase()
        : undefined;

    // Normalize Mobile
    const nextMobile =
      updateUserData.mobileNo !== undefined &&
        updateUserData.mobileNo !== null
        ? String(updateUserData.mobileNo)
          .replace(/[^0-9]/g, "")
        : undefined;

    // Email Duplicate Check
    if (
      nextEmail &&
      nextEmail !== existingUser.email
    ) {

      const emailExists =
        await this.userModel.findOne({
          email: nextEmail,
          _id: {
            $ne: new Types.ObjectId(userId),
          },
        });

      if (emailExists) {
        throw new Error(
          "DUPLICATE_EMAIL",
        );
      }

      updateUserData.email =
        nextEmail as any;
    }

    // Mobile Duplicate Check
    if (
      nextMobile &&
      String(existingUser.mobileNo) !==
      nextMobile
    ) {

      const mobileExists =
        await this.userModel.findOne({
          mobileNo: Number(nextMobile),
          _id: {
            $ne: new Types.ObjectId(userId),
          },
        });

      if (mobileExists) {
        throw new Error(
          "DUPLICATE_MOBILE",
        );
      }

      updateUserData.mobileNo =
        Number(nextMobile) as any;
    }

    // =========================
    // ROLE UPDATE LOGIC
    // =========================

    if (updateUserData.roleId) {

      const roleData =
        await this.RoleTableModel.findById(
          updateUserData.roleId,
        );

      if (!roleData) {
        throw new Error(
          "INVALID_ROLE",
        );
      }

      // Save ObjectId
      updateUserData.roleId =
        new Types.ObjectId(
          updateUserData.roleId.toString(),
        ) as any;

      // Save Role Name
      updateUserData.role = "admin";
    }

    // =========================
    // UPDATE USER
    // =========================

    console.log(updateUserData, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")

    const updatedUser =
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            ...updateUserData,
            modified: new Date(),
          },
        },
        { new: true },
      );

    return updatedUser;
  }


  async findAllUsers(pageNo: number, search: string, roleId?: string): Promise<any> {
    const filter: any = { role: "admin", is_deleted: 0 };

    // Apply role filter only when roleId is provided and valid
    if (
      roleId &&
      roleId.trim() !== '' &&
      Types.ObjectId.isValid(roleId)
    ) {
      filter.roleId = new Types.ObjectId(roleId);
    }

    if (search && search.trim() !== "") {
      const searchValue = search.trim();
      const searchRegex = { $regex: searchValue, $options: "i" };

      const orConditions: any[] = [
        { name: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },

        // ✅ full name search
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$name", " ", "$lastName"] },
              regex: searchValue,
              options: "i"
            }
          }
        }
      ];

      // ✅ Mobile search (prefix match using range)
      if (!isNaN(Number(searchValue))) {
        const num = Number(searchValue);
        const length = searchValue.length;

        const min = num * Math.pow(10, 10 - length);
        const max = min + Math.pow(10, 10 - length) - 1;

        orConditions.push({
          mobileNo: { $gte: min, $lte: max }
        });
      }

      filter.$or = orConditions;
    }

    const limit = 10;
    const skip = pageNo * limit;

    // const users = await this.userModel
    //   .find(filter)
    //   .skip(skip)
    //   .limit(limit)
    //   .exec();

    const users = await this.userModel.aggregate([

      // STEP 1
      {
        $match: filter,
      },

      // STEP 2
      {
        $sort: {
          date: -1,
        },
      },

      // STEP 3
      {
        $skip: skip,
      },

      // STEP 4
      {
        $limit: limit,
      },

      // STEP 5 → lookup groupingEmails by email
      {
        $lookup: {
          from: "role_table",
          localField: "roleId",
          foreignField: "_id",
          as: "roleData",
        },
      },

      // STEP 8 → final response
      {
        $project: {

          _id: 1,
          name: 1,
          lastName: 1,
          email: 1,
          mobileNo: 1,
          role: 1,
          date: 1,
          modified: 1,
          status: 1,
          roleId: 1,
          city: 1,
          state: 1,
          country: 1,

          // role_id: {
          //   $arrayElemAt: ["$roleData._id", 0],
          // },

          role_name: {
            $arrayElemAt: ["$roleData.roleName", 0],
          },
        },
      },
    ]);

    const total = await this.userModel.countDocuments(filter);

    return { users, total };
  }

  // async findAll(pageNo: number, search: string): Promise<any> {
  //   const filter: any = { role: "member", is_deleted: 0 };

  //   if (search && search.trim() !== "") {
  //     const searchValue = search.trim();
  //     const searchRegex = { $regex: searchValue, $options: "i" };

  //     const orConditions: any[] = [
  //       { name: searchRegex },
  //       { lastName: searchRegex },
  //       { email: searchRegex },

  //       // ✅ full name search
  //       {
  //         $expr: {
  //           $regexMatch: {
  //             input: { $concat: ["$name", " ", "$lastName"] },
  //             regex: searchValue,
  //             options: "i"
  //           }
  //         }
  //       }
  //     ];

  //     // ✅ Mobile search (prefix match using range)
  //     if (!isNaN(Number(searchValue))) {
  //       const num = Number(searchValue);
  //       const length = searchValue.length;

  //       const min = num * Math.pow(10, 10 - length);
  //       const max = min + Math.pow(10, 10 - length) - 1;

  //       orConditions.push({
  //         mobileNo: { $gte: min, $lte: max }
  //       });
  //     }

  //     filter.$or = orConditions;
  //   }

  //   const limit = 10;
  //   const skip = pageNo * limit;

  //   const users = await this.userModel
  //     .find(filter)
  //     .skip(skip)
  //     .limit(limit)
  //     .exec();

  //   const total = await this.userModel.countDocuments(filter);

  //   return { users, total };
  // }

  async findAll(pageNo: number, search: string): Promise<any> {

    const filter: any = {
      role: "member",
      is_deleted: 0,
    };

    if (search && search.trim() !== "") {

      const searchValue = search.trim();
      const searchRegex = {
        $regex: searchValue,
        $options: "i",
      };

      const orConditions: any[] = [
        { name: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },

        // full name search
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: [
                  "$name",
                  " ",
                  { $ifNull: ["$lastName", ""] }
                ]
              },
              regex: searchValue,
              options: "i",
            },
          },
        },
      ];

      // mobile search
      if (!isNaN(Number(searchValue))) {

        const num = Number(searchValue);
        const length = searchValue.length;

        const min = num * Math.pow(10, 10 - length);
        const max = min + Math.pow(10, 10 - length) - 1;

        orConditions.push({
          mobileNo: {
            $gte: min,
            $lte: max,
          },
        });
      }

      filter.$or = orConditions;
    }

    const limit = 10;
    const skip = pageNo * limit;

    const users = await this.userModel.aggregate([

      // STEP 1
      {
        $match: filter,
      },

      // STEP 2
      {
        $sort: {
          date: -1,
        },
      },

      // STEP 3
      {
        $skip: skip,
      },

      // STEP 4
      {
        $limit: limit,
      },

      // STEP 5 → lookup groupingEmails by email
      {
        $lookup: {
          from: "groupingEmails",
          localField: "email",
          foreignField: "email",
          as: "groupingData",
        },
      },

      // STEP 6
      {
        $unwind: {
          path: "$groupingData",
          preserveNullAndEmptyArrays: true,
        },
      },

      // STEP 7 → lookup groupForEmail by groupId
      {
        $lookup: {
          from: "groupForEmail",
          let: {
            gid: "$groupingData.groupId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$gid"],
                },
              },
            },
          ],
          as: "groupData",
        },
      },

      // STEP 8 → final response
      {
        $project: {

          _id: 1,
          name: 1,
          lastName: 1,
          email: 1,
          mobileNo: 1,
          role: 1,
          date: 1,
          modified: 1,
          status: 1,
          roleId: 1,
          city: 1,
          state: 1,
          country: 1,

          groupId: {
            $arrayElemAt: ["$groupData._id", 0],
          },

          groupName: {
            $arrayElemAt: ["$groupData.groupName", 0],
          },
        },
      },
    ]);

    const total = await this.userModel.countDocuments(filter);

    return {
      users,
      total,
    };
  }

  async findAllusr(pageNo: number, search: string): Promise<any> {

    const filter: any = {
      role: "member"
    };

    // if (search && search.trim() !== "") {

    //   const searchValue = search.trim();
    //   const searchRegex = {
    //     $regex: searchValue,
    //     $options: "i",
    //   };

    //   const orConditions: any[] = [
    //     { name: searchRegex },
    //     { lastName: searchRegex },
    //     { email: searchRegex },

    //     // full name search
    //     {
    //       $expr: {
    //         $regexMatch: {
    //           input: {
    //             $concat: [
    //               "$name",
    //               " ",
    //               { $ifNull: ["$lastName", ""] }
    //             ]
    //           },
    //           regex: searchValue,
    //           options: "i",
    //         },
    //       },
    //     },
    //   ];

    //   // mobile search
    //   if (!isNaN(Number(searchValue))) {

    //     const num = Number(searchValue);
    //     const length = searchValue.length;

    //     const min = num * Math.pow(10, 10 - length);
    //     const max = min + Math.pow(10, 10 - length) - 1;

    //     orConditions.push({
    //       mobileNo: {
    //         $gte: min,
    //         $lte: max,
    //       },
    //     });
    //   }

    //   filter.$or = orConditions;
    // }

    // const limit = 10;
    // const skip = pageNo * limit;

    const users = await this.userModel.aggregate([

      // STEP 1
      {
        $match: filter,
      },

      // STEP 2
      {
        $sort: {
          date: -1,
        },
      },

      // STEP 5 → lookup groupingEmails by email
      {
        $lookup: {
          from: "groupingEmails",
          localField: "email",
          foreignField: "email",
          as: "groupingData",
        },
      },

      // STEP 6
      {
        $unwind: {
          path: "$groupingData",
          preserveNullAndEmptyArrays: true,
        },
      },

      // STEP 7 → lookup groupForEmail by groupId
      {
        $lookup: {
          from: "groupForEmail",
          let: {
            gid: "$groupingData.groupId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$gid"],
                },
              },
            },
          ],
          as: "groupData",
        },
      },

      // STEP 8 → final response
      {
        $project: {

          _id: 1,
          name: 1,
          lastName: 1,
          email: 1,
          is_deleted: 1,
          status: 1,

          groupId: {
            $arrayElemAt: ["$groupData._id", 0],
          },

          groupName: {
            $arrayElemAt: ["$groupData.groupName", 0],
          },
        },
      },
    ]);

    const total = await this.userModel.countDocuments(filter);

    return {
      users,
      total,
    };
  }

  async findAllDeleted(pageNo: number, search: string): Promise<any> {
    const filter: any = { role: "member", is_deleted: 1 };

    if (search && search.trim() !== "") {
      filter.name = { $regex: search, $options: "i" };
    }

    const limit = 10;
    const skip = pageNo * limit;

    const users = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.userModel.countDocuments(filter);

    return { users, total };
  }

  async findAllDeletedVedic(pageNo: number, search: string, roleId ?: string): Promise<any> {
    const filter: any = { role: "admin", is_deleted: 1 };

    // Apply role filter only when roleId is provided and valid
    if (
      roleId &&
      roleId.trim() !== '' &&
      Types.ObjectId.isValid(roleId)
    ) {
      filter.roleId = new Types.ObjectId(roleId);
    }

    if (search && search.trim() !== "") {
      filter.name = { $regex: search, $options: "i" };
    }

    const limit = 10;
    const skip = pageNo * limit;

    const users = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.userModel.countDocuments(filter);

    return { users, total };
  }


  async sendOtp(
    email: string,
    mobileNumber: String,
    requestFor: string,
  ): Promise<any> {
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      const mobile_number = mobileNumber
        ? mobileNumber.toString().replace(/[^0-9]/g, '')
        : '';

      const findMobile = await this.userModel.find({ mobileNo: mobile_number, role: { $ne: "guest" } });
      const findUser = await this.userModel.find({ email: normalizedEmail, role: { $ne: "guest" } });

      const generateOtp = this.generateRandomNumber(5);

      // const expiryTime = Date.now() + 30 * 1000; // 30 seconds from now
      const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now
      console.log('expiryTime', expiryTime);
      console.log('generateOtp', generateOtp);
      if (requestFor === 'changePassword') {
        console.log('requestFor<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< ');
        if (findUser && findUser.length > 0) {
          // Send reset-password OTP email with dedicated template
          const userName = findUser[0]?.name || 'there';
          const emailResult = await sendResetPasswordOtpEmail(email, userName, generateOtp);
          if (!emailResult.status) {
            return { status: false, message: emailResult.message };
          }
          // Save OTP in the database
          let result = await this.emailOtpModel.findOneAndUpdate(
            { email: normalizedEmail },
            { otp: generateOtp, expire_in: expiryTime },
            { upsert: true },
          );

          let result1 = await this.emailOtpModel.findOne({ email: normalizedEmail });
          if (result) {
            return { status: true, message: 'OTP sent successfully', result1 };
          }
        } else {
          return { status: false, message: 'User not found.' };
        }
      } else {
        if (findUser && findUser.length > 0) {
          return {
            status: false,
            message: 'User already registered with this email',
          };
        }
        if (findMobile && findMobile.length > 0) {
          return {
            status: false,
            message: 'User already registered with this mobile number',
          };
        }
        // Send OTP email using the function from nodemailer.controller
        const emailResult = await sendOtpEmail(email, generateOtp);
        if (!emailResult.status) {
          return { status: false, message: emailResult.message };
        }
        console.log('requestFor<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< else');
        let result = await this.emailOtpModel.updateOne(
          { email: normalizedEmail },
          { $set: { otp: generateOtp, expire_in: expiryTime } },
          { upsert: true },
        );

        let result1 = await this.emailOtpModel.findOne({ email: normalizedEmail });
        if (result) {
          return { status: true, message: 'OTP sent successfully', result1 };
        }
      }
    } catch (error) {
      console.error('Error in sendOtp:', error);
      return { status: false, message: 'An error occurred while sending OTP.' };
    }
  }

  async sendOtpForPassword(email: string): Promise<any> {
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      const findUser = await this.userModel.find({ email: normalizedEmail });

      const generateOtp = this.generateRandomNumber(5);

      const expiryTime = Date.now() + 30 * 1000; // 30 seconds from now
      // const expiryTime = Date.now() + 2 * 60 * 1000; // 2 minutes from now
      console.log('expiryTime', expiryTime);
      console.log('generateOtp', generateOtp);

      if (findUser && findUser.length > 0) {
      }

      // Send OTP email using the function from nodemailer.controller
      // const emailResult = await sendOtpForPassword(email, generateOtp);
      // if (!emailResult.status) {
      //   return { status: false, message: emailResult.message };
      // }
      console.log('requestFor<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< else');
      let result = await this.emailOtpModel.updateOne(
        { email: normalizedEmail },
        { $set: { otp: generateOtp, expire_in: expiryTime } },
        { upsert: true },
      );

      let result1 = await this.emailOtpModel.findOne({ email: normalizedEmail });
      if (result) {
        return { status: true, message: 'OTP sent successfully', result1 };
      }
    } catch (error) {
      console.error('Error in sendOtp:', error);
      return { status: false, message: 'An error occurred while sending OTP.' };
    }
  }

  async verifyOtp(email: string, otp: number): Promise<any> {
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      // Find OTP record
      const otpRecord = await this.emailOtpModel.findOne({ email: normalizedEmail, otp });

      if (!otpRecord) {
        return {
          status: false,
          message: 'OTP is required or the entered OTP is invalid.',
        };
      }

      // Check if OTP is expired using expire_in field
      const now = Date.now();
      if (now > otpRecord.expire_in.getTime()) {
        return {
          status: false,
          message: 'OTP has expired. Please request a new one.',
        };
      }

      return {
        status: true,
        message: 'Your email successfully verified',
        result: otpRecord,
      };
    } catch (error) {
      console.error('Error in OTP verify:', error);
      return {
        status: false,
        message: 'An error occurred while verifying OTP.',
      };
    }
  }

  async changePassword(
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<any> {
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      if (password !== confirmPassword) {
        return {
          status: false,
          message: 'Password and confirm password do not match.',
        };
      }

      const findUser = await this.userModel.findOne({ email: normalizedEmail });
      if (findUser) {
        const encryptedPassword = await this.bcryptPassword(password); // ✅ await is required here
        const newPassword = await this.userModel.findOneAndUpdate(
          { email: normalizedEmail },
          { $set: { password: encryptedPassword } },
          { new: true },
        );

        return {
          status: true,
          message: 'Password changed successfully',
          newPassword,
        };
      } else {
        return {
          status: false,
          message: 'User does not exist with this email!',
        };
      }
    } catch (error) {
      console.error('Error in changePassword:', error);
      return {
        status: false,
        message: 'An error occurred while changing the password.',
      };
    }
  }

  private generateRandomNumber(length = 5): string {
    let text = '';
    const possible = '123456789';
    for (let i = 0; i < length; i++) {
      const sup = Math.floor(Math.random() * possible.length);
      text += i > 0 && sup === i ? '0' : possible.charAt(sup);
    }
    return text;
  }

  private async bcryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    console.log(salt, password);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  private async decryptPassword(
    enteredPassword: string,
    storedHashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, storedHashedPassword);
  }

  async addAddress(suscribeData: Partial<address>): Promise<any> {
    // =========================
    // PHONE VALIDATION
    // Mobile or landline allowed
    // =========================

    let phone = String(suscribeData.mobile)
      .replace(/\s+/g, '')
      .replace(/-/g, '');

    // Allow:
    // +919876543210
    // 9876543210
    // 01412345678
    // 1412345678

    const phoneRegex = /^(\+?[1-9][0-9]{7,14})$/;

    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number');
    }
    let setAddress = `${suscribeData?.flatNo},${suscribeData?.area},${suscribeData.city},${suscribeData.state},${suscribeData.pincode}`;
    const location = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=%7B${setAddress}%7D&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    );
    console.log(location.data.results, "location.data.results")
    if (location.data.results.length == 0) {
      throw new Error('Please enter a valid address');
    }
    console.log(location.data.results, "location.data.results")
    const validated = await axios.post(
      'https://api.goshippo.com/addresses/',
      {
        name: suscribeData.name,
        street1: `${suscribeData['flatNo']}`,
        street2: `${suscribeData['area']}`,
        city: suscribeData['city'],
        state: suscribeData['state'],
        zip: suscribeData['pincode'],
        country: suscribeData['country'],
        phone: suscribeData['mobile'],
        longitude: location.data.results[0].geometry.location.lng,
        latitude: location.data.results[0].geometry.location.lat,
        validate: true,
        email: 'info@vedichealth.org',
        is_residential: false,
      },
      {
        headers: {
          Authorization: `${process.env.SHIPPOKEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log(
      validated.data,
      validated.data.validation_results.is_vaild,
      validated.data.object_id,
    );
    if (validated.data.validation_results.is_valid) {
      const createdAddress = new this.addressModel({
        ...suscribeData,
        user_id: new Types.ObjectId(suscribeData.user_id), // Ensure it's a valid ObjectId
        shippoAddressId: validated.data.object_id,
      });
      return createdAddress.save();
      // throw new Error(`Please enter a valid address. We can't deliver here`);
    } else {
      throw new Error(`Please enter a valid address. We can't deliver here`);
    }
  }

  async getAllAddresses(user: String) {
    try {
      console.log(user, 'address');
      const data = await this.addressModel
        .find({ is_deleted: 0, user_id: new ObjectId(user) })
        .exec();
      return {
        data,
      };
    } catch (error) {
      console.error('Error in getAllAddresses:', error);
      throw new Error('Database query failed');
    }
  }

  async deleteAddress(addressId: string): Promise<boolean> {
    try {
      const result = await this.addressModel.findOneAndUpdate(
        { _id: addressId, is_deleted: 0 }, // Only delete if not already deleted
        { $set: { is_deleted: 1, modified: new Date() } }, // Soft delete
        { new: true },
      );

      return result ? true : false;
    } catch (error) {
      console.error('Error in deleteAddress:', error);
      throw new Error('Database query failed');
    }
  }

  async editAddress(
    addressId: string,
    updatedData: Partial<address>,
  ): Promise<address | null> {
    try {
      const objectId = new Types.ObjectId(addressId); // Convert to ObjectId

      // Remove `_id` from update data to prevent conflicts
      delete updatedData.id;

      const result = await this.addressModel.findOneAndUpdate(
        { _id: objectId, is_deleted: 0 }, // Only update if not deleted
        {
          $set: {
            ...updatedData,
            modified: new Date(), // Update modified timestamp
          },
        },
        { new: true },
      );

      return result;
    } catch (error) {
      console.error('Error in editAddress:', error);
      throw new Error('Database update failed');
    }
  }

  async primaryAddress(
    addressId: string,
    userId: string,
  ): Promise<address | null> {
    try {
      const objectId = new Types.ObjectId(addressId); // Convert to ObjectId

      // Remove `_id` from update data to prevent conflic

      const updateAlladdress = await this.addressModel
        .updateMany(
          { user_id: userId },
          {
            $set: {
              primary: 0,
              modified: new Date(),
            },
          },
        )
        .exec();

      const result = await this.addressModel.findOneAndUpdate(
        { _id: objectId }, // Only update if not deleted
        {
          $set: {
            primary: 1,
            modified: new Date(), // Update modified timestamp
          },
        },
        { new: true },
      );

      return result;
    } catch (error) {
      console.error('Error in editAddress:', error);
      throw new Error('Database update failed');
    }
  }

  async searchUser(data): Promise<any> {
    try {
      console.log(data, "input");

      let filter: any = {
        role: "member"
      };

      // ✅ SEARCH LOGIC
      if (data && data.trim() !== "") {
        const searchValue = data.trim();

        filter.$or = [
          { email: { $regex: searchValue, $options: "i" } },
          { name: { $regex: searchValue, $options: "i" } },
          { lastName: { $regex: searchValue, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$mobileNo" },
                regex: searchValue,
                options: "i"
              }
            }
          }
        ];
      }

      console.log(filter, "filter");

      const users = await this.userModel.aggregate([
        { $match: filter },

        // ✅ ADDRESS
        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "user_id",
            as: "address"
          }
        },

        // ✅ ACTIVE MEMBERSHIP
        {
          $lookup: {
            from: "membershipbuyhistroys",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user_id", "$$userId"] },
                      { $eq: ["$is_expired", false] },
                      { $eq: ["$status", "paid"] }
                    ]
                  }
                }
              }
            ],
            as: "membershipHistory"
          }
        },

        // ✅ MEMBERSHIP DETAILS
        {
          $lookup: {
            from: "membershipmanagements",
            let: { membershipIds: "$membershipHistory.membership_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$membershipIds"] }
                }
              }
            ],
            as: "membership"
          }
        }
      ]);

      return users || [];

    } catch (err) {
      console.error("Search Error:", err);
      throw err;
    }
  }

  async searchUserByAdmin(data): Promise<any> {
    try {
      console.log(data, "input");

      let filter: any = {
        role: "member",
        _id: new Types.ObjectId(data.userId)
      };

      // ✅ SEARCH LOGIC
      // if (data && data.trim() !== "") {
      //   const searchValue = data.trim();

      //   filter.$or = [
      //     { email: { $regex: searchValue, $options: "i" } },
      //     { name: { $regex: searchValue, $options: "i" } },
      //     { lastName: { $regex: searchValue, $options: "i" } },
      //     {
      //       $expr: {
      //         $regexMatch: {
      //           input: { $toString: "$mobileNo" },
      //           regex: searchValue,
      //           options: "i"
      //         }
      //       }
      //     }
      //   ];
      // }

      console.log(filter, "filter");

      const users = await this.userModel.aggregate([
        { $match: filter },

        // ✅ ADDRESS
        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "user_id",
            as: "address"
          }
        },

        // ✅ ACTIVE MEMBERSHIP
        {
          $lookup: {
            from: "membershipbuyhistroys",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user_id", "$$userId"] },
                      { $eq: ["$is_expired", false] },
                      { $eq: ["$status", "paid"] }
                    ]
                  }
                }
              }
            ],
            as: "membershipHistory"
          }
        },

        // ✅ MEMBERSHIP DETAILS
        {
          $lookup: {
            from: "membershipmanagements",
            let: { membershipIds: "$membershipHistory.membership_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$membershipIds"] }
                }
              }
            ],
            as: "membership"
          }
        }
      ]);

      return users || [];

    } catch (err) {
      console.error("Search Error:", err);
      throw err;
    }
  }


  async viewUser(data): Promise<any> {
    try {
      let filter: any = { role: "member" };
      // if(filter.email){
      filter._id = new Types.ObjectId(data['_id'])
      // }
      // filter.mobileNo = Number(data['mobileNo'])
      console.log(filter, "filter")
      const users = await this.userModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "user_id",
            as: "address"
          }
        },
        {
          $lookup: {
            from: "membershipbuyhistroys",
            localField: "_id",
            foreignField: "user_id",
            as: "membershipHistory"
          }
        },
        {
          $lookup: {
            from: "membershipmanagements",
            let: { membershipIds: "$membershipHistory.membership_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$membershipIds"] }
                }
              }
            ],
            as: "membership"
          }
        },
        {
          $lookup: {
            from: "userfamilies",
            localField: "_id",
            foreignField: "userId",
            as: "userFamilyDetails"
          }
        },
        {
          $lookup: {
            from: "membershipbuyhistroys",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$userId"] }
                }
              },
              {
                $lookup: {
                  from: "membershipmanagements",
                  localField: "membership_id",
                  foreignField: "_id",
                  as: "membershipData"
                }
              },
              { $unwind: { path: "$membershipData", preserveNullAndEmptyArrays: true } },

              {
                $project: {
                  _id: 1,
                  membership_id: 1,
                  renewal_date: 1,
                  expire_in: 1,
                  status: 1,
                  is_expired: 1,
                  date: 1,

                  // merged fields
                  plan_name: "$membershipData.plan_name",
                  price: "$membershipData.price",
                  plan_description: "$membershipData.plan_description",
                  image: "$membershipData.image"
                }
              }
            ],
            as: "membershipDetails"
          }
        },
        {
          $lookup: {
            from: "ordermanagements",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userId", "$$userId"] }
                }
              },
              {
                $lookup: {
                  from: "membershipmanagements",
                  localField: "membershipId",
                  foreignField: "_id",
                  as: "membershipDataFoCard"
                }
              },
              { $unwind: { path: "$membershipDataFoCard", preserveNullAndEmptyArrays: true } },

              {
                $project: {
                  _id: 1,
                  paymentDetails: 1,
                  created_at: 1,
                  // merged fields
                  plan_name: "$membershipDataFoCard.plan_name",
                  price: "$membershipDataFoCard.price"
                }
              }
            ],
            as: "orderDetailsForCard"
          }
        }
      ]);


      if (users) {
        console.log(users, "users")

        return users;
      } else {
        return
      }
    } catch (err) {
      return err
    }
  }

  async viewVedicUser(data): Promise<any> {
    try {
      let filter: any = {};
      // if(filter.email){
      filter._id = new Types.ObjectId(data['_id'])
      // }
      // filter.mobileNo = Number(data['mobileNo'])
      console.log(filter, "filter")
      const users = await this.userModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "user_id",
            as: "address"
          }
        },
        {
          $lookup: {
            from: "membershipbuyhistroys",
            localField: "_id",
            foreignField: "user_id",
            as: "membershipHistory"
          }
        },
        {
          $lookup: {
            from: "membershipmanagements",
            let: { membershipIds: "$membershipHistory.membership_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ["$_id", "$$membershipIds"] }
                }
              }
            ],
            as: "membership"
          }
        },
        {
          $lookup: {
            from: "userfamilies",
            localField: "_id",
            foreignField: "userId",
            as: "userFamilyDetails"
          }
        },
        {
          $lookup: {
            from: "membershipbuyhistroys",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", "$$userId"] }
                }
              },
              {
                $lookup: {
                  from: "membershipmanagements",
                  localField: "membership_id",
                  foreignField: "_id",
                  as: "membershipData"
                }
              },
              { $unwind: { path: "$membershipData", preserveNullAndEmptyArrays: true } },

              {
                $project: {
                  _id: 1,
                  membership_id: 1,
                  renewal_date: 1,
                  expire_in: 1,
                  status: 1,
                  is_expired: 1,

                  // merged fields
                  plan_name: "$membershipData.plan_name",
                  price: "$membershipData.price",
                  plan_description: "$membershipData.plan_description",
                  image: "$membershipData.image"
                }
              }
            ],
            as: "membershipDetails"
          }
        },
        {
          $lookup: {
            from: "ordermanagements",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userId", "$$userId"] }
                }
              },
              {
                $lookup: {
                  from: "membershipmanagements",
                  localField: "membershipId",
                  foreignField: "_id",
                  as: "membershipDataFoCard"
                }
              },
              { $unwind: { path: "$membershipDataFoCard", preserveNullAndEmptyArrays: true } },

              {
                $project: {
                  _id: 1,
                  paymentDetails: 1,
                  created_at: 1,
                  // merged fields
                  plan_name: "$membershipDataFoCard.plan_name",
                  price: "$membershipDataFoCard.price"
                }
              }
            ],
            as: "orderDetailsForCard"
          }
        }
      ]);


      if (users) {
        console.log(users, "users")

        return users;
      } else {
        return
      }
    } catch (err) {
      return err
    }
  }

  async loginAsGuest(userData: Partial<User>): Promise<any> {
    try {
      const { email, mobileNo, password = 'Vedic@123' } = userData;

      // Check if email already exists
      const existingEmail = await this.userModel.findOne({ email: email.trim().toLocaleLowerCase() });
      if (existingEmail) {
        return { status: true, statusCode: 200, user: existingEmail };
      }

      // Check if mobile number already exists
      const existingMobile = await this.userModel.findOne({ mobileNo });
      if (existingMobile) {
        return { status: true, statusCode: 200, user: existingMobile };
      }
      const customerCount = await this.userModel.countDocuments();

      // Encrypt password
      const hashedPassword = await this.bcryptPassword(password);
      const user = {
        ...userData,
        email: email.trim().toLocaleLowerCase(),
        password: hashedPassword,
        role: 'guest',
        date: new Date(),
        modified: new Date(),
        vedicCustomerId: customerCount + 1
      };

      const createdUser = await this.userModel.create(user); // new this.userModel(user);
      // await createdUser.save();

      const customer = await this.stripe.customers.create({
        email: user.email.trim().toLocaleLowerCase(),
        name: createdUser.name,
        metadata: { userId: createdUser._id.toString() },
      });
      createdUser.stripeCustomerId = customer.id;
      await createdUser.save();
      // Send welcome email (non-blocking; registration succeeds even if email fails)
      // try {
      //   await sendWelcomeEmail(createdUser.email, createdUser.name);
      // } catch (emailErr) {
      //   console.error('Welcome email failed:', emailErr);
      // }
      // Convert to plain object & remove password
      const userObj = createdUser.toObject();
      delete userObj.password;

      return { status: true, statusCode: 200, message: 'User Registered as Guest', user: userObj };
    } catch (error: any) {
      console.error('Error creating guest user:', error);
      return {
        status: false,
        message: 'An error occurred while creating the guest user.',
        error,
      };
    }
  }


  async softDeleteUser(userId: Types.ObjectId) {
    try {
      console.log('Soft deleting user with ID:', userId);
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: userId, is_deleted: 0 }, // ✅ Only non-deleted users
        {
          $set: {
            is_deleted: 1,
            modified: new Date()
          }
        },
        { new: true } // ✅ Return updated document
      );

      // ✅ If not found
      if (!updatedUser) {
        return {
          message: 'User not found or already deleted',
          statusCode: 404,
        };
      }

      // ✅ Success response
      return {
        message: 'User deleted successfully',
        statusCode: 200,
        data: updatedUser,
      };

    } catch (error) {
      console.error('Error in softDeleteUser service:', error);
      return {
        message: 'Error while deleting user',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async activeUser(userId: Types.ObjectId) {
    try {
      console.log('Soft deleting user with ID:', userId);
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: userId, is_deleted: 1 }, // ✅ Only non-deleted users
        {
          $set: {
            is_deleted: 0,
            modified: new Date()
          }
        },
        { new: true } // ✅ Return updated document
      );

      // ✅ If not found
      if (!updatedUser) {
        return {
          message: 'User not found or already activated',
          statusCode: 404,
        };
      }

      // ✅ Success response
      return {
        message: 'User activate successfully',
        statusCode: 200,
        data: updatedUser,
      };

    } catch (error) {
      console.error('Error in softDeleteUser service:', error);
      return {
        message: 'Error while activating user',
        statusCode: 500,
        error: error.message,
      };
    }
  }


}
