import { Controller, Get, Post, Body, Request, UseInterceptors, Param, UploadedFiles } from '@nestjs/common';
import { Express } from 'express';
import { UserService } from './user.service';
import { User, address } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';

@Controller('users')
@UseInterceptors(Base64Interceptor)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("create")
  async create(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user: Partial<User> = JSON.parse(decodedData);

      // Await the create method to ensure the user is properly created
      const created = await this.userService.create(user);
      console.log(created)

      if (!created.status) {
        return {
          message: created.message || 'Failed to create user.',
          statusCode: 400,  // Bad request for duplicate or invalid data
          ...created
        };
      }

      return {
        message: 'User successfully created!',
        statusCode: 201,
        data: created.user   // send full user (same as login)
      };

    } catch (error) {
      console.error("Error in create API:", error);
      return {
        message: 'An error occurred while creating the user.',
        statusCode: 500
      };
    }
  }

   @Post("createUser")
  async createUser(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user: Partial<User> = JSON.parse(decodedData);

      // Await the create method to ensure the user is properly created
      const created = await this.userService.createUser(user);
      console.log(created)

      if (!created.status) {
        return {
          message: created.message || 'Failed to create user.',
          statusCode: 400,  // Bad request for duplicate or invalid data
          ...created
        };
      }

      return {
        message: 'User successfully created!',
        statusCode: 201,
        data: created.user   // send full user (same as login)
      };

    } catch (error) {
      console.error("Error in create API:", error);
      return {
        message: 'An error occurred while creating the user.',
        statusCode: 500
      };
    }
  }

  @Post("createUserByPractitionar")
  async createUserByPractitionar(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user: Partial<User> = JSON.parse(decodedData);

      // Await the create method to ensure the user is properly created
      const created = await this.userService.createUserByPractitionar(user);
      console.log(created)

      if (!created.status) {
        return {
          message: created.message || 'Failed to create user.',
          statusCode: 400,  // Bad request for duplicate or invalid data
          ...created
        };
      }

      return {
        message: 'User successfully created!',
        statusCode: 201,
        data: created.user   // send full user (same as login)
      };

    } catch (error) {
      console.error("Error in create API:", error);
      return {
        message: 'An error occurred while creating the user.',
        statusCode: 500
      };
    }
  }

  


  @Post("login")
  async login(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user = JSON.parse(decodedData);


      const created = await this.userService.login(user.email, user.password);

      if (!created.status) {
        return {
          message: created.message || 'Failed to Login.',
          statusCode: 400,  // Bad request for duplicate or invalid data
        };
      }
      console.log(created, "lklk")
      return {
        message: 'User successfully sign in',
        statusCode: 201,
        data: created.user
      };
    } catch (error) {
      console.error("Error in create API:", error);
      return {
        message: 'An error occurred while creating the user.',
        statusCode: 500
      };
    }
  }

  @Post('updateProfile')
  async editProfile(
    @Request() req: Request,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user: Partial<User> = JSON.parse(decodedData);

      const userId = user['user_id'];
      if (!userId) {
        return { message: 'User ID is required.', statusCode: 400 };
      }

      if (files?.image?.[0]) {
        user['image'] = files.image[0].path;
      }

      const updatedUser = await this.userService.updateUser(userId, user);

      if (!updatedUser) {
        return { message: 'Failed to update user.', statusCode: 400 };
      }

      return { message: 'User successfully updated!', statusCode: 200, data: updatedUser };
    } catch (error) {
      // ✅ custom duplicate handling
      if (error?.message === "DUPLICATE_EMAIL") {
        return { message: "Email already registered.", statusCode: 400 };
      }
      if (error?.message === "DUPLICATE_MOBILE") {
        return { message: "Mobile number already registered.", statusCode: 400 };
      }

      return { message: 'An error occurred while updating the user.', statusCode: 500 };
    }
  }

  //  @Post('editVedicUser')
  // async editVedicUser(
  //   @Request() req: Request,
  //   @UploadedFiles() files: { image?: Express.Multer.File[] },
  //   @Body('data') data: string,
  // ) {
  //   try {
  //     console.log(data,"wehfgwefgweyfgywegfywegfywegfygfeeygwefgge")
  //     const decodedData = Buffer.from(data, 'base64').toString('utf-8');
  //     const user: Partial<User> = JSON.parse(decodedData);

  //     console.log(user,"wejfeihfuwefhuwehfuwehfuehfuehfwuhewfuhwef")

  //     const userId = user['user_id'];
  //     console.log(userId,":ASADADADADADDA")
  //     if (!userId) {
  //       return { message: 'User ID is required.', statusCode: 400 };
  //     }

  //     if (files?.image?.[0]) {
  //       user['image'] = files.image[0].path;
  //     }

  //     const updatedUser = await this.userService.editVedicUser(userId, user);

  //     if (!updatedUser) {
  //       return { message: 'Failed to update user.', statusCode: 400 };
  //     }

  //     return { message: 'User successfully updated!', statusCode: 200, data: updatedUser };
  //   } catch (error) {
  //     console.log(error,"hhedehdehdehdehduedh")
  //     // ✅ custom duplicate handling
  //     if (error?.message === "DUPLICATE_EMAIL") {
  //       return { message: "Email already registered.", statusCode: 400 };
  //     }
  //     if (error?.message === "DUPLICATE_MOBILE") {
  //       return { message: "Mobile number already registered.", statusCode: 400 };
  //     }

  //     return { message: 'An error occurred while updating the user.', statusCode: 500 };
  //   }
  // }
 @Post('editVedicUser')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ]),
)
async editVedicUser(
  @UploadedFiles() files: { image?: Express.Multer.File[] },
  @Body('data') data: string,
) {
  try {

    console.log(data, 'Incoming data');

    if (!data) {
      return {
        message: 'Data field is required',
        statusCode: 400,
      };
    }

    const decodedData = Buffer.from(data, 'base64').toString('utf-8');

    const user: Partial<User> = JSON.parse(decodedData);

    console.log(user);

    const userId = user['user_id'];

    if (!userId) {
      return {
        message: 'User ID is required.',
        statusCode: 400,
      };
    }

    if (files?.image?.[0]) {
      user['image'] = files.image[0].path;
    }

    const updatedUser = await this.userService.editVedicUser(
      userId,
      user,
    );

    return {
      message: 'User successfully updated!',
      statusCode: 200,
      data: updatedUser,
    };

  } catch (error) {

    console.log(error);

    return {
      message: 'Something went wrong',
      statusCode: 500,
    };
  }
}

  @Post("getVedicAllUsers/:pageNo")
  async findAllUsers(
    @Param("pageNo") pageNo: number,
    @Body('data') data: string
  ) {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const requestData = JSON.parse(decodedData);

    const search = requestData.search || "";
    const roleId = requestData.roleId || "";
    const data1 = await this.userService.findAllUsers(pageNo, search, roleId);

    return {
      statusCode: 201,
      data: data1.users,
      total: data1.total,
    };
  }


  @Post("getAllUsers/:pageNo")
  async findAll(
    @Param("pageNo") pageNo: number,
    @Body('data') data: string
  ) {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const requestData = JSON.parse(decodedData);

    const search = requestData.search || "";
    const data1 = await this.userService.findAll(pageNo, search);

    return {
      statusCode: 201,
      data: data1.users,
      total: data1.total,
    };
  }

  @Post("getAllUsersForDropdown")
  async findAllusr(
    @Param("pageNo") pageNo: number,
    @Body('data') data: string
  ) {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const requestData = JSON.parse(decodedData);

    const search = requestData.search || "";
    const data1 = await this.userService.findAllusr(pageNo, search);

    return {
      statusCode: 201,
      data: data1.users,
      total: data1.total,
    };
  }

@Post("getAllDeletedUsers/:pageNo")
  async findAllDeleted(
    @Param("pageNo") pageNo: number,
    @Body('data') data: string
  ) {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const requestData = JSON.parse(decodedData);

    const search = requestData.search || "";
    const data1 = await this.userService.findAllDeleted(pageNo, search);

    return {
      statusCode: 201,
      data: data1.users,
      total: data1.total,
    };
  }

  @Post("getAllDeletedVedicUsers/:pageNo")
  async findAllDeletedVedic(
    @Param("pageNo") pageNo: number,
    @Body('data') data: string
  ) {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const requestData = JSON.parse(decodedData);

    const search = requestData.search || "";
    const roleId = requestData.roleId || "";
    const data1 = await this.userService.findAllDeletedVedic(pageNo, search, roleId);

    return {
      statusCode: 201,
      data: data1.users,
      total: data1.total,
    };
  }



  @Post("sendOtp")
  async sendOtp(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user = JSON.parse(decodedData);
      const requestFor = user?.requestFor
      console.log(user, "user")
      const created = await this.userService.sendOtp(user.email, user.mobile_number, requestFor);

      console.log(created, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")

      if (!created.status) {
        return {
          message: created.message || 'Failed to send otp.',
          statusCode: 400,  // Bad request for duplicate or invalid data
        };
      }

      return {
        message: 'OTP send successfully',
        statusCode: 201,
        data: created
      };
    } catch (error) {
      console.error("Error in create API:", error);
      return {
        message: 'An error occurred while send otp.',
        statusCode: 500
      };
    }
  }

  @Post("sendOtpForPassword")
  async sendOtpForPassword(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user = JSON.parse(decodedData);
      const requestFor = user?.requestFor

      const created = await this.userService.sendOtpForPassword(user.email);

      console.log(created, "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")

      if (!created.status) {
        return {
          message: created.message || 'Failed to send otp.',
          statusCode: 400,  // Bad request for duplicate or invalid data
        };
      }

      return {
        message: 'OTP send successfully',
        statusCode: 201,
        data: created
      };
    } catch (error) {
      console.error("Error in create API:", error);
      return {
        message: 'An error occurred while send otp.',
        statusCode: 500
      };
    }
  }

  @Post("verifyOtp")
  async verifyOtp(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user = JSON.parse(decodedData);

      const verification = await this.userService.verifyOtp(user.email, user.otp);

      if (!verification.status) {
        return {
          message: verification.message || 'Failed to verify OTP.',
          statusCode: 400,
        };
      }

      return {
        message: 'OTP verified successfully',
        statusCode: 200,
        data: verification.result
      };
    } catch (error) {
      console.error("Error in OTP verify:", error);
      return {
        message: 'An error occurred while verifying OTP.',
        statusCode: 500
      };
    }
  }


  @Post("changePassword")
  async changePassword(@Request() req: Request, @Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user = JSON.parse(decodedData);

      const result = await this.userService.changePassword(user.email, user.password, user.confirmPassword);

      if (!result.status) {
        return {
          message: result.message,
          statusCode: 400,
        };
      }

      return {
        statusCode: 200,
        message: result.message,
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error in changePassword:", error);
      return {
        message: 'An error occurred while changing the password.',
        statusCode: 500
      };
    }
  }


  @Post('add-address')
  async addAddress(@Request() req: Request, @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const suscribeData: Partial<address> = JSON.parse(decodedData);

      console.log('Decoded Address Data:', suscribeData);

      if (!suscribeData.user_id) {
        throw new Error('user_id is required');
      }

      if (!Types.ObjectId.isValid(suscribeData.user_id as any)) {
        throw new Error('Invalid user_id format');
      }

      const createdAddress = await this.userService.addAddress(suscribeData);

      return {
        message: 'Address added successfully!',
        statusCode: 201,
        data: createdAddress,
      };
    } catch (error) {
      console.error('Error processing address data:', error);
      return {
        message: 'Invalid data format or server error.',
        statusCode: 400,
        error: error.message,
      };
    }
  }



  @Post('all-address')
  async getAllAddresses(@Body('data') data: string) {
    try {
      // Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const result = await this.userService.getAllAddresses(JSON.parse(decodedData)?.user);
      return {

        statusCode: 201,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return {
        message: 'An error occurred while fetching addresses',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('delete-address')
  async deleteAddress(@Body('data') data: string) {
    try {
      // Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      console.log('Request Data:', requestData);

      const addressId = requestData.addressId;
      if (!addressId) {
        return { message: 'Address ID is required', statusCode: 400 };
      }

      const result = await this.userService.deleteAddress(addressId);

      if (!result) {
        return { message: 'Address not found or already deleted', statusCode: 404 };
      }

      return { message: 'Address deleted successfully', statusCode: 200 };
    } catch (error) {
      console.error('Error deleting address:', error);
      return {
        message: 'An error occurred while deleting the address',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('edit-address')
  async editAddress(@Body('data') data: string) {
    try {
      // Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const updatedData = JSON.parse(decodedData);

      console.log('Updated Data:', updatedData);

      const addressId = updatedData.id;
      if (!addressId || !Types.ObjectId.isValid(addressId)) {
        return { message: 'Valid Address ID is required', statusCode: 400 };
      }

      const result = await this.userService.editAddress(addressId, updatedData);

      if (!result) {
        return { message: 'Address not found', statusCode: 404 };
      }

      return { message: 'Address updated successfully', statusCode: 200, data: result };
    } catch (error) {
      console.error('Error updating address:', error);
      return {
        message: 'An error occurred while updating the address',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('setPrimary')
  async primaryAddress(@Body('data') data: string) {
    try {
      // Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const updatedData = JSON.parse(decodedData);

      console.log('Updated Data:', updatedData);

      const addressId = updatedData.address_id;
      const userId = updatedData.user_id
      if (!addressId || !Types.ObjectId.isValid(addressId)) {
        return { message: 'Valid Address ID is required', statusCode: 400 };
      }

      const result = await this.userService.primaryAddress(addressId, userId);

      if (!result) {
        return { message: 'Address not found', statusCode: 404 };
      }

      return { message: 'Address updated successfully', statusCode: 200, data: result };
    } catch (error) {
      console.error('Error updating address:', error);
      return {
        message: 'An error occurred while updating the address',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post("members")
  async getMembers() {
    try {
      const members = await this.userService.findMembers();
      return {
        statusCode: 200,
        data: members,
      };
    } catch (error) {
      console.error("Error fetching members:", error);
      return {
        statusCode: 500,
        message: "An error occurred while fetching members",
        error: error.message,
      };
    }
  }
  @Post("searchUser")
  async searchUser(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      const data1 = await this.userService.searchUser(requestData);
      if (data1) {

        return {
          statusCode: 200,
          data: data1
        };
      } else {
        return {
          statusCode: 204,
          message: "No member found",
        };
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        statusCode: 500,
        message: "An error occurred while fetching user",
        error: error.message,
      };
    }

  }

  @Post("searchUserByAdmin")
  async searchUserByAdmin(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      const data1 = await this.userService.searchUserByAdmin(requestData);
      if (data1) {

        return {
          statusCode: 200,
          data: data1
        };
      } else {
        return {
          statusCode: 204,
          message: "No member found",
        };
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        statusCode: 500,
        message: "An error occurred while fetching user",
        error: error.message,
      };
    }

  }

  @Post("viewUser")
  async viewUser(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      console.log(requestData,"dkjcjwjijiwdjied")

      const data1 = await this.userService.viewUser(requestData);
      if (data1) {

        return {
          statusCode: 200,
          data: data1
        };
      } else {
        return {
          statusCode: 204,
          message: "No member found",
        };
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        statusCode: 500,
        message: "An error occurred while fetching user",
        error: error.message,
      };
    }

  }

   @Post("viewVedicUser")
  async viewVedicUser(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      const data1 = await this.userService.viewVedicUser(requestData);
      if (data1) {

        return {
          statusCode: 200,
          data: data1
        };
      } else {
        return {
          statusCode: 204,
          message: "No member found",
        };
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        statusCode: 500,
        message: "An error occurred while fetching user",
        error: error.message,
      };
    }

  }

  @Post("loginAsGuest")
  async loginAsGuest(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      const data1 = await this.userService.loginAsGuest(requestData);
      // if(data1){

      //   return {
      //     statusCode: 200,
      //     data: data1
      //   };
      // }else{
      //   return {
      //   statusCode: 204,
      //   message: "No member found",
      // };
      // }
      return data1
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        statusCode: 500,
        message: "An error occurred while fetching user",
        error: error.message,
      };
    }

  }


  @Post('soft-delete-user')
  async deleteUser(@Body('data') data: any) {
    try {
      // ✅ Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user = JSON.parse(decodedData);
      const userId = user['id'];

      console.log(`Soft deleting user with id: ${userId}`);

      // ✅ Validate ObjectId
      if (!Types.ObjectId.isValid(userId)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // ✅ Call service
      return this.userService.softDeleteUser(new Types.ObjectId(userId));

    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        message: 'An error occurred while deleting the user',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('activate-user')
  async activeUser(@Body('data') data: any) {
    try {
      // ✅ Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user = JSON.parse(decodedData);
      const userId = user['id'];

      console.log(`Soft deleting user with id: ${userId}`);

      // ✅ Validate ObjectId
      if (!Types.ObjectId.isValid(userId)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // ✅ Call service
      return this.userService.activeUser(new Types.ObjectId(userId));

    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        message: 'An error occurred while deleting the user',
        statusCode: 500,
        error: error.message,
      };
    }
  }

}