import { userFamilyService } from './user_family.service';
import { Controller, Get, Post, Body, UploadedFile, Request, UseInterceptors } from '@nestjs/common';
import { UserFamily, address } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('user-family')
@UseInterceptors(Base64Interceptor)
export class userFamilyController {
  constructor(private readonly userFamilyService: userFamilyService) { }

  @Post("create")
  async create(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user: Partial<UserFamily> = JSON.parse(decodedData);

      // Await the create method to ensure the user is properly created
      const created = await this.userFamilyService.create(user);
      console.log(created)

      if (!created.status) {
        return {
          message: created.message || 'Failed to create user.',
          statusCode: 400,  // Bad request for duplicate or invalid data
          ...created
        };
      }

      return {
        message: 'UserFamily successfully created!',
        statusCode: 201,
        data: created
      };
    } catch (error) {
      console.error("Error in create API:", error);
      return {
        message: 'An error occurred while creating the user family.',
        statusCode: 500
      };
    }
  }


  @Post("find")
  async find(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const user: Partial<UserFamily> = JSON.parse(decodedData);

      // Await the create method to ensure the user is properly created
      const userFamily = await this.userFamilyService.find(user)
      if (!userFamily.status) {
        return {
          message: userFamily.message || 'Failed to create user.',
          statusCode: 400,  // Bad request for duplicate or invalid data
          ...userFamily
        };
      }

      return {
        message: 'UserFamily fatched successfully ',
        statusCode: 201,
        data: userFamily
      };
    } catch (error) {
      console.error("Error in create API:", error);
      return {
        message: 'An error occurred while creating the user family.',
        statusCode: 500
      };
    }
  }


@Post("update")
async update(@Request() req: Request, @Body('data') data: string) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const user: Partial<UserFamily> & { id?: string; _id?: string } = JSON.parse(decodedData);

    // accept either id or _id
    const id = user.id || user._id;
    if (!id || !Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId format', statusCode: 400 };
    }

    const updated = await this.userFamilyService.update({ ...user, id });
    if (!updated.status) {
      return { message: updated.message || 'Failed to update user family.', statusCode: 400, ...updated };
    }
    return { message: 'UserFamily updated successfully', statusCode: 200, data: updated };
  } catch (error) {
    console.error("Error in update API:", error);
    return { message: 'An error occurred while updating the user family.', statusCode: 500 };
  }
}

  @Post("delete")
  async delete(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const id = payload['id'];

      if (!Types.ObjectId.isValid(id)) {
        return { message: 'Invalid ObjectId format', statusCode: 400 };
      }

      const deleted = await this.userFamilyService.delete(id);

      if (!deleted.status) {
        return {
          message: deleted.message || 'Failed to delete user family.',
          statusCode: 400,
          ...deleted
        };
      }

      return {
        message: 'UserFamily deleted successfully',
        statusCode: 200,
        data: deleted
      };
    } catch (error) {
      console.error("Error in delete API:", error);
      return {
        message: 'An error occurred while deleting the user family.',
        statusCode: 500
      };
    }
  }
}
