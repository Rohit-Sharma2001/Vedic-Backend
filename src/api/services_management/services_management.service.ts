// File: services_management.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServicesManagement, ServicesManagementDocument, Employee, EmployeeDocument, AddOns, AddOnsDocument, CenterResources, CenterResourcesDocument, ServicePrice, ServicePriceDocument } from 'src/schema/schema';
import moment from 'moment';
@Injectable()
export class ServicesManagementService {
  constructor(
    @InjectModel(ServicesManagement.name) private serviceModel: Model<ServicesManagementDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(AddOns.name) private addOnsModel: Model<AddOnsDocument>,
    @InjectModel(CenterResources.name) private centerResourcesModel: Model<CenterResourcesDocument>,
    @InjectModel(ServicePrice.name) private servicePriceModel: Model<ServicePriceDocument>,
  ) { }

  async create(data: Partial<any>) {

    const result: Partial<any> = await new this.serviceModel(data).save()
    console.log(result, "datatttttt")

    const employeeDataWithRef = []
    for (const item of data.employeeData) {
      await this.employeeModel.findByIdAndUpdate({ _id: new Types.ObjectId(item._id) }, { $push: { services: result._id } })
      delete item._id
      employeeDataWithRef.push({ ...item, serviceId: new Types.ObjectId(result._id), userId: new Types.ObjectId(item.userId) })
    }
    // data.employeeData.map((item) => ({
    //   ...item, serviceId: new Types.ObjectId(result._id), userId: new Types.ObjectId(item.userId)

    // }));
    // if(employeeDataWithRef?._id){

    //    delete employeeDataWithRef?._id
    // }
    console.log(employeeDataWithRef, "employeeDataWithRef")
    // Insert into servicePriceModel with the new reference
    await this.servicePriceModel.insertMany(employeeDataWithRef);

    return { ...result, employeeData: employeeDataWithRef };

    // return { ...result }
  }

  async findAll(page: number, pageSize: number, serviceTypeId?: string, centerId?: string | string[]) {
    const skip = (page - 1) * pageSize;
    const filter: any = {};

    // ✅ Filter by service type (if sent)
    if (serviceTypeId && Types.ObjectId.isValid(serviceTypeId)) {
      filter.service_type = new Types.ObjectId(serviceTypeId);
    }

    // ✅ Handle filtering by one or more centers
    if (centerId && Array.isArray(centerId) && centerId.length > 0) {
      const validCenterIds = centerId
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
      // Services whose "centerId" array contains any of these
      filter.centerId = { $in: validCenterIds };
    } else if (centerId && typeof centerId === 'string' && Types.ObjectId.isValid(centerId)) {
      filter.centerId = { $in: [new Types.ObjectId(centerId)] };
    }

    // ✅ Fetch filtered results
    const result = await this.serviceModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .populate('service_type', 'name')
      .exec();

    const count = await this.serviceModel.countDocuments(filter);

    return {
      message: 'Fetched successfully',
      statusCode: 200,
      data: result,
      totalCount: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }



  // services_management.service.ts
  async findOneById(id: string) {
    const result = await this.serviceModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },

      // 1️⃣ Build employees list from ServicePrice instead of Employee.services
      {
        $lookup: {
          from: 'serviceprices',
          let: { service_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$serviceId', '$$service_id'] },
              },
            },
            {
              $lookup: {
                from: 'employees',
                localField: 'userId',
                foreignField: 'userId',
                as: 'employee',
              },
            },
            { $unwind: '$employee' },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            {
              $project: {
                _id: '$employee._id', // employee document id
                userId: '$userId', // practitioner user id
                name: '$user.name',
                email: '$user.email',
                mobile: '$user.mobileNo',
                price: '$price',
                status: '$employee.status', // employee status
                duration: '$duration', // duration from ServicePrice
                employeeHourlyRate: '$employee.salary',
              },
            },
          ],
          as: 'employees',
        },
      },

      // 2️⃣ Add-ons (unchanged)
      {
        $lookup: {
          from: 'addons',
          localField: 'add_ons',
          foreignField: '_id',
          as: 'add_ons',
        },
      },
      {
        $addFields: {
          add_ons: {
            $map: {
              input: '$add_ons',
              as: 'a',
              in: {
                _id: '$$a._id',
                name: '$$a.name',
                price: '$$a.price',
                description: '$$a.description',
              },
            },
          },
        },
      },

      // 3️⃣ Resources (unchanged)
      {
        $lookup: {
          from: 'centerresources',
          localField: 'resource',
          foreignField: '_id',
          as: 'resource',
        },
      },
      {
        $addFields: {
          resource: {
            $map: {
              input: '$resource',
              as: 'r',
              in: { _id: '$$r._id', name: '$$r.name' },
            },
          },
        },
      },

      // 4️⃣ Centers: resolve centerId[] to id + name
      {
        $lookup: {
          from: 'centermanagements',
          localField: 'centerId',
          foreignField: '_id',
          as: 'centers',
        },
      },
      {
        $addFields: {
          centers: {
            $map: {
              input: '$centers',
              as: 'c',
              in: {
                _id: '$$c._id',
                centerName: '$$c.centerName',
              },
            },
          },
        },
      },

      // 5️⃣ Service type: resolve to id + name
      {
        $lookup: {
          from: 'servicetypes',
          localField: 'service_type',
          foreignField: '_id',
          as: 'serviceType',
        },
      },
      { $unwind: { path: '$serviceType', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          service_type: {
            _id: '$serviceType._id',
            name: '$serviceType.name',
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return { message: 'Not found', statusCode: 404 };
    }

    return { message: 'Fetched successfully', statusCode: 200, data: result };
  }


  async updateService(id: string, updates: any) {
    try {
      const serviceId = new Types.ObjectId(id);

      // 1️⃣ Update main service record
      await this.serviceModel.updateOne(
        { _id: serviceId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      // 2️⃣ Handle employeeData updates
      if (updates.employeeData && Array.isArray(updates.employeeData)) {
        const employeeData = updates.employeeData.map((emp) => ({
          serviceId,
          userId: new Types.ObjectId(emp.userId),
          price: Number(emp.price),
          duration: String(emp.duration),
          created_at: new Date(),
        }));

        // Clear old pricing records
        await this.servicePriceModel.deleteMany({ serviceId });

        // Add new pricing data
        if (employeeData.length > 0) {
          await this.servicePriceModel.insertMany(employeeData);
        }

        // 3️⃣ Sync employee references
        for (const emp of updates.employeeData) {
          await this.employeeModel.updateOne(
            { _id: new Types.ObjectId(emp._id) },
            { $addToSet: { services: serviceId } }
          );
        }
      }

      return { message: "Updated successfully", statusCode: 200 };
    } catch (error) {
      console.error("Service update error:", error);
      return { message: "Update error", statusCode: 500, error: error.message };
    }
  }



  async deleteService(id: string) {
    const result = await this.serviceModel.deleteOne({ _id: new Types.ObjectId(id) });
    await this.servicePriceModel.deleteMany({ serviceId: new Types.ObjectId(id) })
    return { message: 'Deleted successfully', statusCode: 200, result };
  }

  async getDetailsForServiceCreate(centerId: string) {
    const centerResources = await this.centerResourcesModel.find({ centerId: new Types.ObjectId(centerId) });
    const addOnsModel = await this.addOnsModel.find({});
    const employeeModel = await this.employeeModel.aggregate([
      {
        $match: {
          $expr: {
            $gt: [
              {
                $size: {
                  $setIntersection: [
                    { $ifNull: ["$centerId", []] },
                    [new Types.ObjectId(centerId)]
                  ]
                }
              },
              0
            ]

          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          pipeline: [
            { $project: { name: 1, email: 1, _id: 0 } }
          ],
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: 1,
          name: '$user.name',
          email: '$user.email',
          status: 1,
        }
      }
    ]);

    // await this.employeeModel.aggregate([{$in:{centerId:new Types.ObjectId(centerId)}},{
    //   $lookup: {
    //     from: 'users',
    //     localField: 'userId',
    //     foreignField: '_id',
    //     as: 'user'
    //   }
    // }, { $unwind: "$user" }, {
    //   $project: {
    //     _id: 0,
    //     name: '$user.name', // or other fields you want from employee
    //     userId: 1
    //   }
    // }]);
    const result = { centerResources, addOnsModel, employeeModel }
    return { message: 'Fatch successfully', statusCode: 200, result };
  }

  async getDetailsForServiceEmployee(servicePrice) {
console.log(servicePrice,"id")
    // const employeeModel = await this.servicePriceModel.aggregate(//{serviceId: new Types.ObjectId(servicePrice.serviceId)})
    //   [
    //   {
    //     $match: {
    //       serviceId: new Types.ObjectId(servicePrice.serviceId)
    //     }
    //   },
    //   // {
    //   //   $lookup: {
    //   //     from: 'serviceprices',
    //   //     localField: 'serviceId',
    //   //     foreignField: 'serviceId',
    //   //     as: 'services',
    //   //   }
    //   // },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'userId',
    //       foreignField: '_id',
    //       pipeline: [
    //         { $project: { name: 1, email: 1, _id: 0 } }
    //       ],
    //       as: 'user'
    //     }
    //   },
    //   { $unwind: '$user' },
    //   {
    //     $lookup: {
    //       from: 'user',
    //       localField: 'userId',
    //       foreignField: '_id',
    //       pipeline: [
    //         { $project: { name: 1, email: 1, _id: 0 } }
    //       ],
    //       as: 'user'
    //     }
    //   },
    //   {
    //     $project: {
    //       userId: 1,
    //       name: '$user.name',
    //       email: '$user.email',
    //       status: 1,
    //     }
    //   }
    // ]);
    const employeeModel = await this.employeeModel.aggregate([
      {
        $match: {
         services: new Types.ObjectId(servicePrice.serviceId),
         is_deleted: 0,
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          pipeline: [
            { $project: { name: 1, email: 1, _id: 0 } }
          ],
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: 1,
          name: '$user.name',
          email: '$user.email',
          status: 1,
        }
      }
    ]);
    console.log(employeeModel,"employeeModel")
    const result = { employeeModel }
    return { message: 'Fatch successfully', statusCode: 200, result };
  }

  async getServiceDuration(id: any) {
    id.serviceId = new Types.ObjectId(id.serviceId)
    id.employeeId = new Types.ObjectId(id.employeeId)
    const result = await this.serviceModel.find(id);
    return { message: 'data find successfully', statusCode: 200, result };
  }

  // File: services_management.service.ts
  async toggleStatus(id: string) {
    const service = await this.serviceModel.findById(id);
    if (!service) {
      return { message: 'Service not found', statusCode: 404 };
    }


    const newStatus = service.status === 1 ? 0 : 1;
    service.status = newStatus;
    service.updated_at = new Date();
    await service.save();


    return { message: 'Status updated', statusCode: 200, newStatus };
  }

  async findPriceById(data) {

    const result = await this.servicePriceModel.find(data);

    if (result.length == 0) return { message: 'Not found', statusCode: 404 };
    return { message: 'Fetched successfully', statusCode: 200, data: result };
    // return `This action returns all servicePrice`;
  }

}
