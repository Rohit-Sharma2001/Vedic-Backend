// enquiry_management.services.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee, EmployeeDocument, User, UserDocument, AppointmentManagement, AppointmentManagementDocument, NonMemberaddress, NonMemberaddressDocument } from '../../schema/schema';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';
@Injectable()
export class EmployeeManagementService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AppointmentManagement.name) private appointmentModel: Model<AppointmentManagementDocument>, // ✅ Add this
    @InjectModel(NonMemberaddress.name) private nonMemberaddresstModel: Model<NonMemberaddressDocument>,
  ) { }

  async create(employeeData: any): Promise<any> {
    try {
      const { email, mobileNo, password, centerId, services, file } = employeeData;

      // Check for existing email or mobile
      const existingEmail = await this.userModel.findOne({ email });
      if (existingEmail) {
        return { status: false, message: "Email already registered." };
      }

      const existingMobile = await this.userModel.findOne({ mobileNo });
      if (existingMobile) {
        return { status: false, message: "Mobile number already registered." };
      }

      // Encrypt password
      const hashedPassword = await this.bcryptPassword(password);

      // ✅ Explicitly assign role 'practitioner'
      const user = {
        ...employeeData,
        password: hashedPassword,
        role: 'practitioner',
        date: new Date(),
        modified: new Date(),
        // Save image/file on the user document
        file: file || employeeData?.image || employeeData?.profileImage
      };

      // Create user entry
      const createdUser = await new this.userModel(user).save();

      // Convert IDs to ObjectId
      const centerIds = centerId?.map(e => new Types.ObjectId(e)) || [];
      const serviceIds = services?.map(e => new Types.ObjectId(e)) || [];

      // Create employee entry
      const userData = {
        ...employeeData,
        centerId: centerIds,
        userId: new Types.ObjectId(createdUser._id as unknown as string),

        services: serviceIds
      };

      const createdEmployee = await new this.employeeModel(userData).save();

      return {
        status: true,
        message: "Employee and Practitioner user created successfully",
        data: {
          user: createdUser,
          employee: createdEmployee
        }
      };

    } catch (error) {
      console.error("Error in create employee:", error);
      return { status: false, message: "Error creating employee", error: error.message };
    }
  }


  async findAll(search: string) {
    const matchStage: any = { is_deleted: 0 };

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ];

    // 🔥 Apply search filter on user.name
    if (search && search.trim() !== "") {
      const searchRegex = { $regex: search, $options: "i" };
      pipeline.push(
        {
          $addFields: {
            fullName: {
              $concat: ["$user.name", " ", "$user.lastName"]
            },
            mobileStr: { $toString: "$user.mobileNo" } // ✅ convert number → string
          }
        },
        {
          $match: {
            $or: [
              { "user.name": searchRegex },
              { "user.lastName": searchRegex },
              { "user.email": searchRegex },
              { fullName: searchRegex },
              { mobileStr: searchRegex } // ✅ now works
            ]
          }
        }
      );
    }

    // ⭐ Ratings Lookup
    pipeline.push(
      {
        $lookup: {
          from: 'employee_reviews',
          let: { empId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: '$employee_id' },
                    { $toString: '$$empId' }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                average_overall: { $avg: '$overall_review' },
                average_punctuality: { $avg: '$punctuality' },
                average_value: { $avg: '$value' },
                average_service: { $avg: '$service' },
                reviews_count: { $sum: 1 }
              }
            }
          ],
          as: 'ratings'
        }
      },
      {
        $unwind: { path: '$ratings', preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          average_ratings: {
            overall_review: { $round: ['$ratings.average_overall', 2] },
            punctuality: { $round: ['$ratings.average_punctuality', 2] },
            value: { $round: ['$ratings.average_value', 2] },
            service: { $round: ['$ratings.average_service', 2] },
            count: '$ratings.reviews_count'
          }
        }
      },
      { $project: { ratings: 0 } }
    );

    const employeeData = await this.employeeModel.aggregate(pipeline);

    return {
      status: true,
      message: 'Employees fetched successfully',
      employeeData
    };
  }


  async findById(id: any) {
    const employeeData = await this.employeeModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $addFields: {
          userId: '$user._id',
          userName: '$user.name',
          userEmail: '$user.email',
          userMobile: '$user.mobileNo',
          userFile: '$user.file',  // ✔ image now included
          userPassword: '$user.password'
        }
      }
    ]);

    return {
      status: true,
      message: 'Employee fetched successfully',
      employeeData,
    };
  }



  async deleteEmployee(id: any) {
    try {
      const employeeId = id._id ? id._id : id;

      if (!Types.ObjectId.isValid(employeeId)) {
        throw new Error(`Invalid ObjectId format: ${employeeId}`);
      }

      const empObjectId = new Types.ObjectId(employeeId);

      // 🔍 Check for existing appointments
      const existingAppointments = await this.appointmentModel.countDocuments({
        employeeId: empObjectId,
        type: 'appointment',
        status: { $ne: 'cancelled' },
      });

      if (existingAppointments > 0) {
        return {
          status: false,
          message: 'Please delete all appointments for this employee first.',
        };
      }

      // ✅ Soft delete employee
      const deletedData = await this.employeeModel.findByIdAndUpdate(
        empObjectId,
        { $set: { is_deleted: 1 } },
        { new: true },
      );

      if (!deletedData) {
        return { status: false, message: 'Employee not found' };
      }

      return { status: true, message: 'Employee deleted successfully' };
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      return {
        status: false,
        message: 'Error deleting employee',
        error: error.message,
      };
    }
  }




  private async bcryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    console.log(salt, password)
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  // employee.services.ts
  async updateEmployee(id: string, updateData: any): Promise<any> {
    try {

      // Convert centerIds to ObjectIds
      let updatedCenterIds = [];
      if (Array.isArray(updateData.centerId)) {
        updatedCenterIds = updateData.centerId.map(cid => new Types.ObjectId(cid));
      }

      const servicesFromSalary =
        Array.isArray(updateData.salary)
          ? updateData.salary
            .map((s: any) => s.serviceId)
            .filter((s: any) => !!s)
          : [];

      const employeeUpdates: Partial<Employee> = {
        salary: updateData.salary,
        working_days: updateData.working_days,
        working_time_start: updateData.working_time_start,
        working_time_end: updateData.working_time_end,
        skills: updateData.skills,
        services: Array.isArray(updateData.services) ? updateData.services : servicesFromSalary,
        expertise: updateData.expertise,
        description: updateData.description,
        designation: updateData.designation,
        is_deleted: updateData.status === 0 ? 1 : 0,

        // 🔥 FIX — update centers
        centerId: updatedCenterIds,
      };

      const updatedEmployee = await this.employeeModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        { $set: employeeUpdates },
        { new: true },
      );

      if (!updatedEmployee) {
        return { status: false, message: 'Employee not found' };
      }

      // Update linked user fields
      const userUpdates: Partial<User> = {
        name: updateData.name,
        email: updateData.email,
        mobileNo: updateData.mobileNo,
      };

      if (updateData.file) {
        userUpdates.file = updateData.file;
      }

      if (updateData.password) {
        const hashedPass = await this.bcryptPassword(updateData.password);
        userUpdates.password = hashedPass;
      }

      await this.userModel.findByIdAndUpdate(
        updatedEmployee.userId,
        { $set: userUpdates },
        { new: true },
      );

      return {
        status: true,
        message: 'Employee updated successfully',
        data: updatedEmployee,
      };

    } catch (error) {
      console.error('Error updating employee:', error);
      return {
        status: false,
        message: 'Error updating employee',
        error: error.message,
      };
    }
  }




  async findByUserId(userId: string): Promise<any> {
    try {
      // Clean input: trim and ensure string type
      const cleanUserId = String(userId).trim();

      // Validate ID
      if (!Types.ObjectId.isValid(cleanUserId)) {
        return { status: false, message: 'Invalid user_id format' };
      }

      const employeeData = await this.employeeModel.aggregate([
        { $match: { userId: new Types.ObjectId(cleanUserId), is_deleted: 0 } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
      ]);

      if (!employeeData || employeeData.length === 0) {
        return { status: false, message: 'Employee not found.' };
      }

      return { status: true, employee: employeeData[0] };
    } catch (error) {
      console.error('Error in findByUserId:', error);
      return { status: false, message: 'Error fetching employee data', error: error.message };
    }
  }

  async toggleStatus(employeeId: string) {
    try {
      const employee = await this.employeeModel.findById(employeeId);

      if (!employee) {
        return { status: false, message: "Employee not found" };
      }

      const newStatus = employee.status === 1 ? 0 : 1;

      employee.status = newStatus;
      await employee.save();

      return {
        status: true,
        message: "Employee status toggled successfully",
        data: { id: employeeId, newStatus }
      };
    } catch (error) {
      console.error("Error toggling employee status:", error);
      return { status: false, message: "Error toggling status", error: error.message };
    }
  }

  async addNonMemberAddress(suscribeData): Promise<any> {
    let setAddress = `${suscribeData?.flatNo},${suscribeData?.area},${suscribeData.city},${suscribeData.state},${suscribeData.pincode}`;
    const location = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=%7B${setAddress}%7D&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    );
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
      'validated.data.validation_results.is_vaild',
      validated.data.object_id,
    );
    if (validated.data.validation_results.is_valid) {
      const createdAddress = new this.nonMemberaddresstModel({
        ...suscribeData,
        employee_user_id: new Types.ObjectId(suscribeData.employee_id), // Ensure it's a valid ObjectId
        shippoAddressId: validated.data.object_id,
      });
      return createdAddress.save();
      // throw new Error(`Please enter a valid address. We can't deliver here`);
    } else {
      throw new Error(`Please enter a valid address. We can't deliver here`);
    }
  }

  async getAllNonMemberAddresses(user) {
    try {
      console.log(user, 'address');
      const data = await this.nonMemberaddresstModel
        .find({ is_deleted: 0, employee_user_id: new Types.ObjectId(user) })
        .exec();
      return {
        data,
      };
    } catch (error) {
      console.error('Error in getAllAddresses:', error);
      throw new Error('Database query failed');
    }
  }

  async deleteNonMemberAddress(addressId: string): Promise<boolean> {
    try {
      const result = await this.nonMemberaddresstModel.findOneAndUpdate(
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

  async editNonMemberAddress(
    addressId: string,
    updatedData: Partial<NonMemberaddress>,
  ): Promise<NonMemberaddress | null> {
    try {
      const objectId = new Types.ObjectId(addressId); // Convert to ObjectId

      // Remove `_id` from update data to prevent conflicts
      delete updatedData.id;

      const result = await this.nonMemberaddresstModel.findOneAndUpdate(
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

  async getCenterWiseEmployee(center) {
    try {
      console.log(center, 'address');
      const matchStage: any = { is_deleted: 0, centerId: new Types.ObjectId(center.centerId) };

      const pipeline: any[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ];

      // 🔥 Apply search filter on user.name
      // if (search && search.trim() !== "") {
      //   pipeline.push({
      //     $match: {
      //       "user.name": { $regex: search, $options: "i" }
      //     }
      //   });
      // }

      // ⭐ Ratings Lookup
      pipeline.push(
        {
          $lookup: {
            from: 'employee_reviews',
            let: { empId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [
                      { $toString: '$employee_id' },
                      { $toString: '$$empId' }
                    ]
                  }
                }
              },
              {
                $group: {
                  _id: null,
                  average_overall: { $avg: '$overall_review' },
                  average_punctuality: { $avg: '$punctuality' },
                  average_value: { $avg: '$value' },
                  average_service: { $avg: '$service' },
                  reviews_count: { $sum: 1 }
                }
              }
            ],
            as: 'ratings'
          }
        },
        {
          $unwind: { path: '$ratings', preserveNullAndEmptyArrays: true }
        },
        {
          $addFields: {
            average_ratings: {
              overall_review: { $round: ['$ratings.average_overall', 2] },
              punctuality: { $round: ['$ratings.average_punctuality', 2] },
              value: { $round: ['$ratings.average_value', 2] },
              service: { $round: ['$ratings.average_service', 2] },
              count: '$ratings.reviews_count'
            }
          }
        },
        { $project: { ratings: 0 } }
      );

      const employeeData = await this.employeeModel.aggregate(pipeline);

      return {
        status: true,
        message: 'Employees fetched successfully',
        employeeData
      };
    } catch (error) {
      console.error('Error in getAllAddresses:', error);
      throw new Error('Database query failed');
    }
  }



  async moveToUser(id: any) {
    try {
      const employeeId = id?._id ? id._id : id;
      console.log(employeeId, "<<<<<<<<<<<<<<<<<<<<<<<,employeeId")

      if (!Types.ObjectId.isValid(employeeId)) {
        throw new Error(`Invalid ObjectId format: ${employeeId}`);
      }

      const empObjectId = new Types.ObjectId(employeeId);

      // // 🔍 Check for existing appointments
      // const existingAppointments = await this.appointmentModel.countDocuments({
      //   employeeId: empObjectId,
      //   type: 'appointment',
      //   status: { $ne: 'cancelled' },
      // });


      // if (existingAppointments > 0) {
      //   return {
      //     status: false,
      //     message:
      //       'Please delete all appointments for this practitioner first.',
      //   };
      // }

      // 🔍 Check employee exists
      const employeeData = await this.employeeModel.findById(empObjectId);

      console.log(employeeData, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAA")

      if (!employeeData) {
        return {
          status: false,
          message: 'Practitioner not found',
        };
      }

      // ✅ Update user role
      if (employeeData.userId) {
        await this.userModel.findByIdAndUpdate(
          employeeData.userId,
          {
            $set: {
              role: 'member',
            },
          },
          { new: true },
        );
      }

      // ✅ Soft delete practitioner
      const updatedEmployee = await this.employeeModel.findByIdAndUpdate(
        empObjectId,
        {
          $set: {
            is_deleted: 1,
          },
        },
        { new: true },
      );

      return {
        status: true,
        message: 'Practitioner moved to user successfully',
        data: updatedEmployee,
      };
    } catch (error) {
      console.error('Error in moveToUser:', error);

      return {
        status: false,
        message: 'Error moving practitioner to user',
        error: error.message,
      };
    }
  }

async moveToPractitioner(id: any) {
  try {
    const employeeId = id?._id ? id._id : id;

    if (!Types.ObjectId.isValid(employeeId)) {
      throw new Error(`Invalid ObjectId format: ${employeeId}`);
    }

    const userObjectId = new Types.ObjectId(employeeId);

    const userData = await this.userModel.findById(userObjectId);

    if (!userData) {
      throw new Error('User not found');
    }

    const employeeData = await this.employeeModel.findOne({
      userId: userObjectId,
    });

    // 🔥 Employee record not found
    if (!employeeData) {
      return {
        status: true,
        openPractitionerForm: true,
        message: 'Practitioner profile not found',
        data: {
          userId: userData._id,
          name: userData.name,
          email: userData.email,
          mobileNo: userData.mobileNo,
        },
      };
    }

    // Existing practitioner found
    const updatedEmployee = await this.employeeModel.findByIdAndUpdate(
      employeeData._id,
      {
        $set: {
          is_deleted: 0,
        },
      },
      { new: true },
    );

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userObjectId,
      {
        $set: {
          role: 'practitioner',
        },
      },
      { new: true },
    );

    return {
      status: true,
      statusCode: 201,
      openPractitionerForm: false,
      message: 'User moved to practitioner successfully',
      data: {
        user: updatedUser,
        employee: updatedEmployee,
      },
    };
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
}


async addPractitioner(data: any): Promise<any> {
  try {
    const {
      userId,
      centerId,
      services,
      file,
    } = data;

    console.log("employeeData => ", data);

    const userObjectId = new Types.ObjectId(userId);

    // Check user exists
    const user = await this.userModel.findById(userObjectId);

    if (!user) {
      return {
        status: false,
        message: 'User not found',
      };
    }

    // Check practitioner already exists
    const existingEmployee = await this.employeeModel.findOne({
      userId: userObjectId,
      is_deleted: 0,
    });

    if (existingEmployee) {
      return {
        status: false,
        message: 'Practitioner already exists',
      };
    }

    const centerIds =
      centerId?.map(
        (id) => new Types.ObjectId(id),
      ) || [];

    const serviceIds =
      services?.map(
        (id) => new Types.ObjectId(id),
      ) || [];

    // Create employee only
    const employeePayload = {
      ...data,
      userId: userObjectId,
      centerId: centerIds,
      services: serviceIds,
      userFile: file || '',
      is_deleted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdEmployee =
      await new this.employeeModel(
        employeePayload,
      ).save();

    // Update role
    await this.userModel.findByIdAndUpdate(
      userObjectId,
      {
        $set: {
          role: 'practitioner',
        },
      },
    );

    return {
      statusCode: 201,
      message:
        'Practitioner created successfully',
      data: createdEmployee,
    };
  } catch (error) {
    console.error(
      'Error creating practitioner:',
      error,
    );

    return {
      status: false,
      message: error.message,
    };
  }
}




}