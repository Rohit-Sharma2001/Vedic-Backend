// add_ons.controller.ts
import { Controller, Get, Post, Body, Request, Put, Param, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { AddOnsService } from './add_ons.services';
import { AddOns } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('add_ons')
@UseInterceptors(Base64Interceptor)
export class AddOnsController {
    constructor(private readonly addOnsService: AddOnsService) {}

    @Post('add')
    async create(@Request() req: Request, @Body('data') data: string) {
        try {
            if (!data) throw new HttpException('Encrypted data is missing', HttpStatus.BAD_REQUEST);

            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const addOns: Partial<AddOns> = JSON.parse(decodedData);

            const createdaddOns = await this.addOnsService.create(addOns);

            return { message: 'AddOn successfully added!', statusCode: 201, data: createdaddOns };
        } catch (error) {
            throw new HttpException(error.message || 'Invalid encrypted data format or server error', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('all')
    async getAll() {
        const addons = await this.addOnsService.findAll();
        return { message: 'All AddOns fetched successfully', statusCode: 200, data: addons };
    }

  // add_ons.controller.ts
@Post('delete')
async deleteAddOn(@Body('data') data: string) {
  try {
    // Decode Base64 data
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const parsed = JSON.parse(decodedData);
    const id = parsed.id;

    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid AddOn ID provided.', HttpStatus.BAD_REQUEST);
    }

    const result = await this.addOnsService.deleteById(id);

    if (!result.status) {
      throw new HttpException(result.message, HttpStatus.NOT_FOUND);
    }

    return {
      message: 'AddOn deleted successfully.',
      statusCode: 200
    };
  } catch (error) {
    throw new HttpException(
      error.message || 'An error occurred while deleting the AddOn.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

}
