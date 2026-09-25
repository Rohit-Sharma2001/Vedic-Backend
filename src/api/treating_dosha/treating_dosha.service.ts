// src/modules/treating_dosha/treating_dosha.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TreatingDoshaImbalance, TreatingDoshaImbalanceDocument } from 'src/schema/schema';

@Injectable()
export class TreatingDoshaService {
  constructor(
    @InjectModel(TreatingDoshaImbalance.name)
    private treatingDoshaModel: Model<TreatingDoshaImbalanceDocument>,
  ) {}

  async create(data: Partial<TreatingDoshaImbalance>): Promise<TreatingDoshaImbalance> {
    const entry = new this.treatingDoshaModel(data);
    return entry.save();
  }

  async findOneById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    const entry = await this.treatingDoshaModel.findById(id).exec();
    if (!entry) {
      return {
        message: 'Entry not found',
        statusCode: 404,
      };
    }

    const hostUrl = 'http://localhost:3008';
    const response = entry.toObject() as any;
    response.imageUrl = entry.banner_image ? `${hostUrl}/${entry.banner_image.replace(/\\/g, '/')}` : null;

    return {
      message: 'Entry fetched successfully!',
      statusCode: 200,
      data: response,
    };
  }

  async update(id: string, data: Partial<TreatingDoshaImbalance>): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    const existing = await this.treatingDoshaModel.findById(id);
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
    result.imageUrl = result.banner_image ? `${hostUrl}/${result.banner_image.replace(/\\/g, '/')}` : null;

    return {
      message: 'Updated successfully',
      statusCode: 200,
      data: result,
    };
  }
}
