// src/modules/amitajain_landingpage/amitajain_landingpage.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AmitaJainQuoteDetails } from 'src/schema/schema';

@Injectable()
export class AmitaJainQuoteService {
  constructor(
    @InjectModel(AmitaJainQuoteDetails.name)
    private readonly model: Model<AmitaJainQuoteDetails>
  ) {}

  async createOrUpdate(data: Partial<AmitaJainQuoteDetails>): Promise<any> {
    let entry = await this.model.findOne();
    if (entry) {
      Object.assign(entry, data);
      await entry.save();
    } else {
      entry = new this.model(data);
      await entry.save();
    }
    return entry;
  }

  async get(): Promise<any> {
    const entry = await this.model.findOne();
    return entry || {};
  }

  async update(id: string, data: Partial<AmitaJainQuoteDetails>): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    const existing = await this.model.findById(id);
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
    return {
      message: 'Updated successfully',
      statusCode: 200,
      data: saved,
    };
  }
}
