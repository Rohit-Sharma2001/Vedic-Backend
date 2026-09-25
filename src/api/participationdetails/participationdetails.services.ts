import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParticipationDetails } from 'src/schema/schema';

@Injectable()
export class ParticipationDetailsService {
  constructor(
    @InjectModel(ParticipationDetails.name)
    private participationModel: Model<ParticipationDetails>,
  ) {}

  async create(details: Partial<ParticipationDetails>) {
    const created = new this.participationModel(details);
    const saved = await created.save();
    return saved.toObject(); // ✅ return plain object (decoded JSON)
  }

  async update(id: string, updates: Partial<ParticipationDetails>) {
    const updated = await this.participationModel.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true },
    ).lean(); // ✅ .lean() returns plain JSON
    return updated;
  }

  async findAll(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const result = await this.participationModel
      .find()
      .skip(skip)
      .limit(pageSize)
      .lean() // ✅ return plain JSON
      .exec();

    const totalCount = await this.participationModel.countDocuments();

    return {
      result,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }
}
