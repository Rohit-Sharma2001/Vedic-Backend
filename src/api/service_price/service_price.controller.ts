import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ServicePriceService } from './service_price.service';
import { ServicePrice, address } from '../../schema/schema';
import { Types } from 'mongoose';

@Controller('service-price')
export class ServicePriceController {
  constructor(private readonly servicePriceService: ServicePriceService) { }

  @Post()
  async create(@Request() req: Request,
    @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      let newServicePrice: Partial<ServicePrice> = JSON.parse(decodedData);

      console.log('Decoded newServicePrice:', newServicePrice);

      const createdServicePrice = await this.servicePriceService.create(newServicePrice);

      // Return a success message
      return {
        message: 'ServicePrice successfully added!',
        statusCode: 201,
        data: createdServicePrice
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

  @Post('findById')
  async findById(@Request() req: Request,
    @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      let servicePrice: Partial<ServicePrice> = JSON.parse(decodedData);

      console.log('Decoded newServicePrice:', servicePrice);
      const findData = {}
      if (servicePrice.userId) {
        findData['userId'] = new Types.ObjectId(servicePrice.userId)
      }
      if (servicePrice.serviceId) {
        findData['serviceId'] = new Types.ObjectId(servicePrice.serviceId)
      }
      return this.servicePriceService.findById(findData);
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }

  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicePriceService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicePriceService.remove(+id);
  }
}
