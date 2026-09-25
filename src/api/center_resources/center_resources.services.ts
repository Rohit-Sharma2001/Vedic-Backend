import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CenterResources, CenterResourcesDocument } from '../../schema/schema';

@Injectable()
export class CenterResourcesService {
    constructor(@InjectModel(CenterResources.name) private CenterResourcesModel: Model<CenterResourcesDocument>) { }

    async create(CenterResourcesData: any): Promise<CenterResources> {
        CenterResourcesData.centerId = new Types.ObjectId(CenterResourcesData.centerId)
        console.log(CenterResourcesData, "CenterResourcesData")
        
        const createdCenterResources = new this.CenterResourcesModel(CenterResourcesData);
        return await createdCenterResources.save();
    }

    async findByCenterId(CenterResourcesData: any): Promise<any> {
        CenterResourcesData.centerId = new Types.ObjectId(CenterResourcesData.centerId)
        console.log(CenterResourcesData, "CenterResourcesData")
        const data = await this.CenterResourcesModel.find({centerId: CenterResourcesData.centerId });
        return data
    }

    async deleteById(id: string): Promise<{ status: boolean; message: string }> {
  try {
    const deleted = await this.CenterResourcesModel.findByIdAndDelete(new Types.ObjectId(id)).exec();

    if (!deleted) {
      return { status: false, message: 'Center Resource not found.' };
    }

    return { status: true, message: 'Center Resource deleted successfully.' };
  } catch (error) {
    return { status: false, message: 'Error deleting Center Resource.' };
  }
}

}