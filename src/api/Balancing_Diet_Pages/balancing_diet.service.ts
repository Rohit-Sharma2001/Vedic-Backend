// src/modules/balancing_diet/balancing_diet.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BalancingDiet,BalancingDietDocument } from 'src/schema/schema';
@Injectable()
export class BalancingDietService {
  constructor(
    @InjectModel(BalancingDiet.name)
    private dietModel: Model<BalancingDietDocument>,
  ) {}

  async create(data: Partial<BalancingDiet>): Promise<BalancingDiet> {
    const entry = new this.dietModel(data);
    return entry.save();
  }

  async findOneById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    const entry = await this.dietModel.findById(id).exec();

    if (!entry) {
      return {
        message: 'Entry not found',
        statusCode: 404,
      };
    }

    const hostUrl = 'http://localhost:3008';
    const response = entry.toObject() as any;
response.imageUrl = entry.file ? `${hostUrl}/${entry.file.replace(/\\/g, '/')}` : null;

 
    return {
      message: 'Entry fetched successfully!',
      statusCode: 200,
      data: response,
    };
  }

    async findByType(type: string): Promise<any> {
    const entries = await this.dietModel.find({ type }).exec();

    const hostUrl = 'http://localhost:3008';

    const data = entries.map(entry => {
      const obj = entry.toObject() as any;
      obj.imageUrl = obj.file ? `${hostUrl}/${obj.file.replace(/\\/g, '/')}` : null;
      return obj;
    });

    return {
      message: 'Entries fetched successfully!',
      statusCode: 200,
      data,
    };
  }


  async update(id: string, data: Partial<BalancingDiet>): Promise<any> {
  if (!Types.ObjectId.isValid(id)) {
    return {
      message: 'Invalid ObjectId format',
      statusCode: 400,
    };
  }

  const existing = await this.dietModel.findById(id);
  if (!existing) {
    return {
      message: 'Entry not found',
      statusCode: 404,
    };
  }

  for (const key in data) {
    if (data[key] !== undefined) {
      existing[key] = data[key];
    }
  }

  const saved = await existing.save();

  const hostUrl = 'http://localhost:3008';
  const result = saved.toObject() as any;
  result.imageUrl = result.file ? `${hostUrl}/${result.file.replace(/\\/g, '/')}` : null;

  return {
    message: 'Updated successfully',
    statusCode: 200,
    data: result,
  };
}

}
