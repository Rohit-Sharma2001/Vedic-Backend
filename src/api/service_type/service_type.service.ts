// File: service_type.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { lookup } from 'dns';
import { Model, Types } from 'mongoose';
import { ServiceType, ServiceTypeDocument } from 'src/schema/schema';

@Injectable()
export class ServiceTypeService {
  constructor(
    @InjectModel(ServiceType.name)
    private model: Model<ServiceTypeDocument>,
  ) { }

  async create(data: Partial<ServiceType>) {
    return new this.model(data).save();
  }

// service_type.service.ts
async findAll(centerId: string, page: number, pageSize: number, search: string) {
  const skip = (page - 1) * pageSize;

  const pipeline: any[] = [];

  // 🔍 search by name
  if (search) {
    pipeline.push({
      $match: { name: { $regex: search, $options: 'i' } },
    });
  }

  // 🔗 join services so we can derive centerIds (do this ALWAYS)
  pipeline.push(
    {
      $lookup: {
        from: 'servicesmanagements',          // make sure this is the actual collection name
        localField: '_id',
        foreignField: 'service_type',
        as: 'service',
      },
    },
    // 🧮 flatten service.centerId values into a unique array "centerIds"
    {
      $addFields: {
        centerIds: {
          $setUnion: [
            {
              $reduce: {
                input: {
                  $map: {
                    input: '$service',
                    as: 's',
                    in: '$$s.centerId',      // can be single ObjectId or an array
                  },
                },
                initialValue: [],
                in: {
                  $concatArrays: [
                    '$$value',
                    {
                      $cond: [
                        { $isArray: '$$this' },
                        '$$this',
                        ['$$this'],
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    }
  );

  // 🏥 optional filter by a specific center
  if (centerId) {
    pipeline.push({
      $match: { centerIds: new Types.ObjectId(centerId) },
    });
  }

  // 🧹 don't leak the raw joined array
  pipeline.push({
    $project: {
      service: 0,
    },
  });

  // 📄 pagination
  pipeline.push({ $skip: skip }, { $limit: pageSize });

  const result = await this.model.aggregate(pipeline).exec();

  // total count (same stages, minus skip/limit)
  const countPipeline = pipeline.filter(
    (stage) => !('$skip' in stage) && !('$limit' in stage)
  );
  countPipeline.push({ $count: 'total' });

  const countResult = await this.model.aggregate(countPipeline).exec();
  const count = countResult[0]?.total || 0;

  return {
    message: 'Fetched successfully',
    statusCode: 200,
    data: result,                 // <-- each item now includes centerIds: ObjectId[]
    totalCount: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  };
}



  async findOneById(id: string) {
    const result = await this.model.findById(id);
    if (!result) return { message: 'Not found', statusCode: 404 };
    return { message: 'Fetched successfully', statusCode: 200, data: result };
  }

  async updateServiceType(id: string, updates: Partial<ServiceType>) {
    const result = await this.model.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: updates },
      { new: true, runValidators: true },
    );
    return { message: 'Updated successfully', statusCode: 200, result };
  }

  async deleteServiceType(id: string) {
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
    { $set: { status: newStatus, updated_at: new Date() } }
  );

  return {
    message: 'Status toggled successfully',
    statusCode: 200,
    newStatus,
  };
}

}
