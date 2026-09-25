// src/modules/ayurvedic_healing/ayurvedic_healing.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AyurVedicNaturalHealing ,AyurVedicNaturalHealingDocument} from 'src/schema/schema';
@Injectable()

export class AyurVedicNaturalHealingService {
 
    constructor(
    @InjectModel(AyurVedicNaturalHealing.name)
    private ayurvedicModel: Model<AyurVedicNaturalHealingDocument>,
  ) {}

  async create(data: Partial<AyurVedicNaturalHealing>): Promise<AyurVedicNaturalHealing> {
    const entry = new this.ayurvedicModel(data);
    return entry.save();
  }

  async findOneById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    const data = await this.ayurvedicModel.findById(id).exec();

    if (!data) {
      return {
        message: 'Entry not found',
        statusCode: 404,
      };
    }

    const hostUrl = 'http://localhost:3008';

    const response = data.toObject() as any;
response.imageUrl = data.file ? `${hostUrl}/${data.file.replace(/\\/g, '/')}` : null;


    return {
      message: 'Entry fetched successfully!',
      statusCode: 200,
      data: response,
    };
  }

  async findAll(page = 1, pageSize = 10): Promise<any> {
    const skip = (page - 1) * pageSize;

    const results = await this.ayurvedicModel.find().skip(skip).limit(pageSize).exec();
    const total = await this.ayurvedicModel.countDocuments();

    const hostUrl = 'http://localhost:3008';
   const formatted = results.map((doc) => {
  const obj = doc.toObject() as any;
  obj.imageUrl = obj.file ? `${hostUrl}/${obj.file.replace(/\\/g, '/')}` : null;
  return obj;
});


    return {
      message: 'Entries fetched successfully!',
      statusCode: 200,
      data: formatted,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async update(id: string, data: Partial<AyurVedicNaturalHealing>): Promise<any> {
  if (!Types.ObjectId.isValid(id)) {
    return {
      message: 'Invalid ObjectId format',
      statusCode: 400,
    };
  }

  const existing = await this.ayurvedicModel.findById(id);
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
