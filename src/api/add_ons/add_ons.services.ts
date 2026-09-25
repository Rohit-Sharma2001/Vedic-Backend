// add_ons.services.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddOns } from '../../schema/schema';

@Injectable()
export class AddOnsService {
    constructor(@InjectModel(AddOns.name) private addOnsModel: Model<AddOns>) {}

    async create(addOnsData: Partial<AddOns>): Promise<AddOns> {
        const createdAddOn = new this.addOnsModel(addOnsData);
        return createdAddOn.save();
    }

    async findAll(): Promise<AddOns[]> {
        return this.addOnsModel.find().exec();
    }

// add_ons.services.ts
async deleteById(id: string): Promise<{ status: boolean; message: string }> {
  try {
    const deleted = await this.addOnsModel.findByIdAndDelete(new Types.ObjectId(id)).exec();

    if (!deleted) {
      return { status: false, message: 'AddOn not found.' };
    }

    return { status: true, message: 'AddOn deleted successfully.' };
  } catch (error) {
    return { status: false, message: 'Error deleting AddOn.' };
  }
}

}
