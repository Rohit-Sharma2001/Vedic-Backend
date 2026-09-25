// src/modules/impact_section/impact_section.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ImpactSection,ImpactSectionDocument } from 'src/schema/schema';
@Injectable()
export class ImpactSectionService {
  constructor(
    @InjectModel(ImpactSection.name)
    private impactModel: Model<ImpactSectionDocument>,
  ) {}

  async create(data: Partial<ImpactSection>): Promise<ImpactSection> {
    const entry = new this.impactModel(data);
    return entry.save();
  }

  async findOneById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId format', statusCode: 400 };
    }
    const entry = await this.impactModel.findById(id);
    if (!entry) {
      return { message: 'Entry not found', statusCode: 404 };
    }
    return { message: 'Fetched successfully', statusCode: 200, data: entry };
  }

  async update(id: string, data: Partial<ImpactSection>): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId format', statusCode: 400 };
    }
    const entry = await this.impactModel.findById(id);
    if (!entry) {
      return { message: 'Entry not found', statusCode: 404 };
    }
    for (const key in data) {
      if (data[key] !== undefined) {
        entry[key] = data[key];
      }
    }
    const saved = await entry.save();
    return { message: 'Updated successfully', statusCode: 200, data: saved };
  }
}
