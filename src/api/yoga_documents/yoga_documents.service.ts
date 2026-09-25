// src/modules/yoga_documents/yoga_documents.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { YogaDocument,YogaDocumentDocument } from 'src/schema/schema';

@Injectable()
export class YogaDocumentsService {
  constructor(
    @InjectModel(YogaDocument.name)
    private readonly yogaDocumentModel: Model<YogaDocumentDocument>,
  ) {}

  async addDocument(data: Partial<YogaDocument>): Promise<any> {
    try {
      const newDoc = new this.yogaDocumentModel(data);
      const saved = await newDoc.save();
      return {
        message: 'Document successfully added!',
        statusCode: 201,
        data: saved,
      };
    } catch (error) {
      console.error('Error adding document:', error);
      return {
        message: 'Failed to add document',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  async deleteDocument(_id: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(_id);
      const deleted = await this.yogaDocumentModel.findByIdAndDelete(objectId);

      if (!deleted) {
        return { message: 'Document not found', statusCode: 404 };
      }

      return {
        message: 'Document successfully deleted!',
        statusCode: 200,
        data: deleted,
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        message: 'Failed to delete document',
        statusCode: 500,
        error: error.message,
      };
    }
  }
}
