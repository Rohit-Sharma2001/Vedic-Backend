// enquiry_management.services.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enquiry, EnquiryDocument } from '../../schema/schema';
import { sendContactEnquiryAdminEmail, sendContactEnquiryUserConfirmationEmail } from 'src/middlewares/nodemailer/nodemailer.controller';

@Injectable()
export class EnquiryManagementService {
  constructor(@InjectModel(Enquiry.name) private enquiryModel: Model<EnquiryDocument>) {}

  async create(enquiryData: Partial<Enquiry>): Promise<Enquiry> {
    const createdEnquiry = new this.enquiryModel(enquiryData);
    const saved = await createdEnquiry.save();
    try {
      const userName = enquiryData.firstName || 'N/A';
      const userEmail = enquiryData.email || '';
      const userPhone = enquiryData.phone != null ? String(enquiryData.phone) : 'N/A';
      await sendContactEnquiryAdminEmail(userName, userEmail || 'N/A', userPhone);
      if (userEmail) {
        await sendContactEnquiryUserConfirmationEmail(userEmail, userName);
      }
    } catch (emailErr) {
      console.error('Enquiry add: contact emails failed:', emailErr);
    }
    return saved;
  }

  async deleteEnquiry(id: any) {
    const deletedData = await this.enquiryModel.deleteOne({ _id: new Types.ObjectId(id) });
    return {
      message: 'Enquiry deleted successfully',
    };
  }

  async findAllEnquiries(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const enquiries = await this.enquiryModel.find().skip(skip).limit(pageSize).exec();
    const totalCount = await this.enquiryModel.countDocuments().exec();
    return {
      message: 'Enquiries successfully fetched!',
      statusCode: 200,
      enquiries,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }
}