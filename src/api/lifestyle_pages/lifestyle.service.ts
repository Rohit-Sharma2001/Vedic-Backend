// src/modules/lifestyle_pages/lifestyle.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lifestyle ,LifestyleDocument } from 'src/schema/schema';
@Injectable()
export class LifestyleService {
  constructor(
    @InjectModel(Lifestyle.name)
    private lifestyleModel: Model<LifestyleDocument>,
  ) {}

  async create(data: Partial<Lifestyle>): Promise<Lifestyle> {
    const entry = new this.lifestyleModel(data);
    return entry.save();
  }

  async findOneById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    const entry = await this.lifestyleModel.findById(id).exec();

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


  async update(id: string, data: Partial<Lifestyle>): Promise<any> {
  if (!Types.ObjectId.isValid(id)) {
    return {
      message: 'Invalid ObjectId format',
      statusCode: 400,
    };
  }

  const existing = await this.lifestyleModel.findById(id);
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
async searchByType(type: string): Promise<any> {
  const entries = await this.lifestyleModel.find({ type }).exec();

  const hostUrl = 'http://localhost:3008';
  const results = entries.map((entry) => {
    const obj = entry.toObject() as any;
    obj.imageUrl = obj.file ? `${hostUrl}/${obj.file.replace(/\\/g, '/')}` : null;
    return obj;
  });

  return {
    message: 'Entries fetched successfully',
    statusCode: 200,
    data: results,
  };
}

}
