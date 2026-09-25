import { Controller, Get, Post, Body,Res, UploadedFile, Request, UseInterceptors,HttpException ,HttpStatus } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistManagement, address } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('waitlist')
@UseInterceptors(Base64Interceptor)
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post("addWaitlist")
    async create(
      @Request() req: Request,
      @Body('data') data: string
    ) { 
      try {
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        const user: Partial<WaitlistManagement> = JSON.parse(decodedData);
  
        // Await the create method to ensure the user is properly created
        const created = await this.waitlistService.create(user);
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
          data: created
        };
      } catch (error) {
        console.error("Error in create API:", error);
        return {
          message: 'An error occurred while creating the user.',
          statusCode: 500
        };
      }
    }

  @Post('user')
  async getByUserId(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decodedData);
      const id = parsed.id;

      if (!Types.ObjectId.isValid(id)) {
        throw new HttpException('Invalid user ID provided.', HttpStatus.BAD_REQUEST);
      }

      const result = await this.waitlistService.getByUserId(id);

      if (!result.status) {
        throw new HttpException(result.message, HttpStatus.NOT_FOUND);
      }

      return {
        message: 'Waitlist data fetched successfully.',
        statusCode: 200,
        data: result.data
      };
    } catch (error) {
      throw new HttpException('Invalid payload.', HttpStatus.BAD_REQUEST);
    }
  }

@Post('delete')
async deleteWaitlist(@Body('data') data: string) {
  const decodedData = Buffer.from(data, 'base64').toString('utf-8');
  const parsed = JSON.parse(decodedData);
  const id = parsed.id;

  if (!Types.ObjectId.isValid(id)) {
    throw new HttpException('Invalid waitlist ID provided.', HttpStatus.BAD_REQUEST);
  }

  const result = await this.waitlistService.deleteById(id);

  if (!result.status) {
    throw new HttpException(result.message, HttpStatus.NOT_FOUND);
  }

  return {
    message: 'Waitlist entry deleted successfully.',
    statusCode: 200
  };
}

@Post('fatchWaitlist')
async fatchWaitlist(@Body('data') data: string) {
  const decodedData = Buffer.from(data, 'base64').toString('utf-8');
  const parsed = JSON.parse(decodedData);
  // const id = parsed.id;

  // if (!Types.ObjectId.isValid(id)) {
  //   throw new HttpException('Invalid waitlist ID provided.', HttpStatus.BAD_REQUEST);
  // }

  const result = await this.waitlistService.fatchWaitlist(parsed);

  if (!result.status) {
    throw new HttpException(result.message, HttpStatus.NOT_FOUND);
  }

  return {
    message: 'Waitlist find successfully.',
    statusCode: 200,
    data:result.data
  };
}



}
