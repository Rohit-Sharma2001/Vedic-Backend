import { Controller, Get, Post, Body, Request, Put, Param, UseInterceptors  ,HttpException,HttpStatus} from '@nestjs/common';
import { CenterResourcesService } from './center_resources.services';
import { CenterResources } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('center-resources')
@UseInterceptors(Base64Interceptor)
export class CenterResourcesController {
    constructor(private readonly centerResourcesService: CenterResourcesService) { }

    @Post('add')
    async create(@Request() req: Request, @Body('data') data: string) {
        try {
            console.log('Request Body:', req.body);
            console.log('Encrypted Data Received:', data);

            if (!data) {
                throw new Error('Encrypted data is missing');
            }

            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            console.log(decodedData,"decodedData")
            const newcenterResources: Partial<CenterResources> = JSON.parse(decodedData);

            console.log('Decoded Enquiry:', newcenterResources);

            const createdEnquiry = await this.centerResourcesService.create(newcenterResources);

            return {
                message: 'centerResources successfully added!',
                statusCode: 201,
                data: createdEnquiry
            };
        } catch (error) {
            console.error('Error decoding or parsing encrypted data:', error);
            return {
                message: 'Invalid encrypted data format or server error.',
                statusCode: 400,
                error: error.message
            };
        }
    }

    @Post('find')
    async findByCenterId(@Request() req: Request, @Body('data') data: string) {
        try {
            console.log('Request Body:', req.body);
            console.log('Encrypted Data Received:', data);

            if (!data) {
                throw new Error('Encrypted data is missing');
            }

            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            console.log(decodedData,"decodedData")
            const newcenterResources: Partial<CenterResources> = JSON.parse(decodedData);

            console.log('Decoded Enquiry:', newcenterResources);
            
            const createdEnquiry = await this.centerResourcesService.findByCenterId(newcenterResources);

            return {
                message: 'centerResources fetch successfully',
                statusCode: 201,
                data: createdEnquiry
            };
        } catch (error) {
            console.error('Error decoding or parsing encrypted data:', error);
            return {
                message: 'Invalid encrypted data format or server error.',
                statusCode: 400,
                error: error.message
            };
        }
    }


    @Post('delete')
async deleteCenterResource(@Body('data') data: string) {
  try {
    // Decode Base64 payload
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const parsed = JSON.parse(decodedData);
    const id = parsed.id;

    // Validate ID
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid Center Resource ID provided.', HttpStatus.BAD_REQUEST);
    }

    // Call service
    const result = await this.centerResourcesService.deleteById(id);

    // Handle response
    if (!result.status) {
      throw new HttpException(result.message, HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Center Resource deleted successfully.',
      statusCode: 200
    };
  } catch (error) {
    throw new HttpException(
      error.message || 'An error occurred while deleting the Center Resource.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

}