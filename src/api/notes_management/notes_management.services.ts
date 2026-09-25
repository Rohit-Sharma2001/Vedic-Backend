// notes_management.services.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notes, NotesDocument } from '../../schema/schema';
import { sendContactEnquiryAdminEmail, sendContactEnquiryUserConfirmationEmail } from 'src/middlewares/nodemailer/nodemailer.controller';

@Injectable()
export class NotesManagementService {
  constructor(@InjectModel(Notes.name) private notesModel: Model<NotesDocument>) {}

  async create(notesData: Partial<Notes>): Promise<Notes> {
    const createdNote = new this.notesModel(notesData);
    const saved = await createdNote.save();
    try {
      const userName = [notesData.firstName, notesData.lastName].filter(Boolean).join(' ') || 'N/A';
      const userEmail = notesData.email || '';
      const userPhone = notesData.mobile != null ? String(notesData.mobile) : 'N/A';
      await sendContactEnquiryAdminEmail(userName, userEmail || 'N/A', userPhone);
      if (userEmail) {
        await sendContactEnquiryUserConfirmationEmail(userEmail, userName);
      }
    } catch (emailErr) {
      console.error('Notes add: contact emails failed:', emailErr);
    }
    return saved;
  }

  async deleteNote(id: any) {
    const deletedData = await this.notesModel.deleteOne({ _id: new Types.ObjectId(id) });
    return {
      message: 'Note deleted successfully',
    };
  }

  async findAllNotes(page: number, pageSize: number,faqName?: string) {
    const skip = (page - 1) * pageSize;  
    const limit = pageSize;  
  
    const filter: any = {};

    if (faqName) {
      filter.name = faqName; 
    }
  
    const FaqManagement = await this.notesModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
  
    const totalCount = await this.notesModel.countDocuments(filter).exec();
  
    return {
      message: 'faqs successfully fetched!',
      statusCode: 201,
      FaqManagement,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }
}