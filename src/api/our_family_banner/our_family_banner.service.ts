// src/modules/our_family_banner/our_family_banner.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OurFamilyBanner,OurFamilyBannerDocument } from 'src/schema/schema';
@Injectable()
export class OurFamilyBannerService {
  constructor(
    @InjectModel(OurFamilyBanner.name)
    private bannerModel: Model<OurFamilyBannerDocument>,
  ) {}

  async create(data: Partial<OurFamilyBanner>): Promise<OurFamilyBanner> {
    const entry = new this.bannerModel(data);
    return entry.save();
  }

  async findOneById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId', statusCode: 400 };
    }

    const entry = await this.bannerModel.findById(id).exec();
    if (!entry) {
      return { message: 'Entry not found', statusCode: 404 };
    }

    const hostUrl = 'http://localhost:3008';
    const result = entry.toObject() as any;
    result.imageUrl = result.file ? `${hostUrl}/${result.file.replace(/\\/g, '/')}` : null;

    return { message: 'Entry fetched successfully', statusCode: 200, data: result };
  }

  async update(id: string, data: Partial<OurFamilyBanner>): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId', statusCode: 400 };
    }

    const entry = await this.bannerModel.findById(id);
    if (!entry) {
      return { message: 'Entry not found', statusCode: 404 };
    }

    for (const key in data) {
      if (data[key] !== undefined) {
        entry[key] = data[key];
      }
    }

    const saved = await entry.save();
    const hostUrl = 'http://localhost:3008';
    const result = saved.toObject() as any;
    result.imageUrl = result.file ? `${hostUrl}/${result.file.replace(/\\/g, '/')}` : null;

    return { message: 'Updated successfully', statusCode: 200, data: result };
  }
}
