// File: src/modules/business_detail/business_detail.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessDetail,BusinessDetailDocument } from 'src/schema/schema';

@Injectable()
export class BusinessDetailService {
  constructor(
    @InjectModel(BusinessDetail.name)
    private model: Model<BusinessDetailDocument>,
  ) {}

  async create(data: Partial<BusinessDetail>) {
    return new this.model(data).save();
  }

  async findAll(page = 1, pageSize = 10, search = '') {
    const skip = (page - 1) * pageSize;

    const baseStages: any[] = [];

    if (search) {
      baseStages.push({
        $match: { heading: { $regex: search, $options: 'i' } },
      });
    }

    const dataPipeline = [
      ...baseStages,
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: pageSize },
    ];

    const countPipeline = [...baseStages, { $count: 'total' }];

    const [data, countArr] = await Promise.all([
      this.model.aggregate(dataPipeline).exec(),
      this.model.aggregate(countPipeline).exec(),
    ]);

    const totalCount = countArr[0]?.total || 0;

    return {
      message: 'Fetched successfully',
      statusCode: 200,
      data,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async findOneById(id: string) {
    const result = await this.model.findById(id);
    if (!result) return { message: 'Not found', statusCode: 404 };
    return { message: 'Fetched successfully', statusCode: 200, data: result };
  }

  async updateBusinessDetail(id: string, updates: Partial<BusinessDetail>) {
    const result = await this.model.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: updates },
      { new: true, runValidators: true },
    );
    return { message: 'Updated successfully', statusCode: 200, result };
  }

  async deleteBusinessDetail(id: string) {
    const result = await this.model.deleteOne({ _id: new Types.ObjectId(id) });
    return { message: 'Deleted successfully', statusCode: 200, result };
  }

  async toggleStatus(id: string) {
    const existing = await this.model.findById(id);
    if (!existing) {
      return { message: 'Not found', statusCode: 404 };
    }
    const newStatus = existing.status === 1 ? 0 : 1;
    await this.model.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: { status: newStatus, updated_at: new Date() } },
    );
    return {
      message: 'Status toggled successfully',
      statusCode: 200,
      newStatus,
    };
  }
}