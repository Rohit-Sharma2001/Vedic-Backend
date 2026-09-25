// src/modules/appointment_page_content/appointment_page_content.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppointmentPageContent, AppointmentPageContentDocument } from 'src/schema/schema';

@Injectable()
export class AppointmentPageContentService {
  constructor(
    @InjectModel(AppointmentPageContent.name)
    private appointmentModel: Model<AppointmentPageContentDocument>,
  ) {}

  async create(data: Partial<AppointmentPageContent>) {
    return new this.appointmentModel(data).save();
  }

  async findOneById(id: string) {
    if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ObjectId', statusCode: 400 };

    const doc = await this.appointmentModel.findById(id);
    if (!doc) return { message: 'Not found', statusCode: 404 };

    const result = doc.toObject() as any;
    result.imageUrl = result.file ? `http://localhost:3008/${result.file.replace(/\\/g, '/')}` : null;

    return { message: 'Success', statusCode: 200, data: result };
  }

  async update(id: string, data: Partial<AppointmentPageContent>) {
    if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ObjectId', statusCode: 400 };

    const entry = await this.appointmentModel.findById(id);
    if (!entry) return { message: 'Entry not found', statusCode: 404 };

    Object.assign(entry, data);
    const saved = await entry.save();
    const result = saved.toObject() as any;
    result.imageUrl = result.file ? `http://localhost:3008/${result.file.replace(/\\/g, '/')}` : null;

    return { message: 'Updated successfully', statusCode: 200, data: result };
  }
}
