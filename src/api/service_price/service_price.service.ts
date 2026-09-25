import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServicePrice, ServicePriceDocument } from 'src/schema/schema';

@Injectable()
export class ServicePriceService {
  constructor(
    @InjectModel(ServicePrice.name)
    private servicePriceModel: Model<ServicePriceDocument>,
  ) { }

  async create(data: Partial<ServicePrice>) {

    const createdServicePrice = new this.servicePriceModel(data);
    return await createdServicePrice.save();
  }

  // service_price.service.ts
async findById(data) {
  const result = await this.servicePriceModel.find(data);

  if (result.length === 0) {
    return { message: 'Not found', statusCode: 404 };
  }

  return { message: 'Fetched successfully', statusCode: 200, data: result };
}


  findOne(id: number) {
    return `This action returns a #${id} servicePrice`;
  }


  remove(id: number) {
    return `This action removes a #${id} servicePrice`;
  }


}
