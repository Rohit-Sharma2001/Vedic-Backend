import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
 
import { faqManagement, faqManagementDocument,faqs,faqsDocument } from '../../schema/schema';

@Injectable()
export class FaqManagementService {
  constructor(@InjectModel(faqManagement.name) private faqManagementModel: Model<faqManagementDocument>,
  @InjectModel(faqs.name) private faqModel: Model<faqsDocument>,) { }

  async create(faqManagementData: Partial<faqManagement>): Promise<faqManagement> {
    const createdFaq = new this.faqManagementModel(faqManagementData);
    // console.log(createdContent,"createdContentcreatedContent",Product)
    return createdFaq.save();
  }

  async deleteFaqManagement(id: any) {
    // The update query
    console.log(id,"uiui")
    const deletedData = await this.faqManagementModel.deleteOne(
      { _id: new ObjectId(id) },
      // data, // Return the updated document
    );
    console.log(deletedData,"deletedData")
    return {
      message: 'File deleted successfully',
      // filePath: file.path,
      };
  }

  async findAll(page: number, pageSize: number,faqName?: string) {
    const skip = (page - 1) * pageSize;  
    const limit = pageSize;  
  
    const filter: any = {};

    if (faqName) {
      filter.name = faqName; 
    }
  
    const FaqManagement = await this.faqManagementModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
  
    const totalCount = await this.faqManagementModel.countDocuments(filter).exec();
  
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

  async createFaq(faqsData: Partial<faqs>): Promise<faqs> {
    const createdFaq = new this.faqModel(faqsData);
    // console.log(createdContent,"createdContentcreatedContent",Product)
    return createdFaq.save();
  }

  async deleteFaq(id: any) {
    // The update query
    // console.log(id,"uiui")
    const deletedData = await this.faqModel.deleteOne(
      { _id: new ObjectId(id) },
      // data, // Return the updated document
    );
    console.log(deletedData,"deletedData")
    return {
      message: 'File deleted successfully',
      // filePath: file.path,
      };
  }

  async findAllFaq(page: number, pageSize: number,faqName?: string) {
    const skip = (page - 1) * pageSize;  
    const limit = pageSize;  
  
    const filter: any = {};

    if (faqName) {
      filter.name = faqName; 
    }
  
    const FaqManagement = await this.faqModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
  
    const totalCount = await this.faqModel.countDocuments(filter).exec();
  
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

  async updateFaqManagement(id: any, faqManagement: Partial<faqManagement>): Promise<any> {  // Return type is updated to 'any' for flexible response
      try {
        console.log(id, "AAAAAAAAAAAAAAAAAAA", faqManagement)
        const objectId = new Types.ObjectId(id);
        const updatedBlogManagement = await this.faqManagementModel.updateOne(
          { _id: objectId },
          { $set: faqManagement }, // Use `$set` to update specific fields
          { new: true, runValidators: true } // Return the updated document and validate schema
        );
  
        if (!updatedBlogManagement) {
          return {
            message: 'faq not found with the provided id',
            statusCode: 404,
            error: `No faq found with id: ${id}`,
          };
        }
  
        // Return success message with updated product
        return {
          message: 'faq successfully updated!',
          statusCode: 201,
          updatedBlogManagement,
        };
      } catch (error) {
        console.error('Error updating faq in the database:', error);
  
        // Return error response
        return {
          message: 'An error occurred while updating the faq',
          statusCode: 500,
          error: error.message,
        };
      }
    }

    // === backend/src/modules/faq_management/faq_management.services.ts ===
// + Add this new method (no other service code touched)
async updateFaq(id: string, payload: Partial<faqs>) {
  if (!Types.ObjectId.isValid(id)) {
    return { message: 'Invalid ObjectId format', statusCode: 400 };
  }
  const updated = await this.faqModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true },
  );
  if (!updated) return { message: 'faq not found', statusCode: 404 };
  return { message: 'faq successfully updated!', statusCode: 200, data: updated };
}

    async findOneById(id: string): Promise<any> {
        try {
          const objectId = new Types.ObjectId(id);
    
          const faqManagementData = await this.faqManagementModel.findOne({ _id: objectId }).exec();
    
          if (!faqManagementData) {
            throw new Error(`faqManagementData not found with id: ${id}`);
          }
          console.log(faqManagementData.file, "opopopopopopopoop")
          const hostUrl = `http://localhost:3008`;
          if (faqManagementData.file) {
            // Format the file path to use forward slashes
            faqManagementData['imageUrl'] = `${hostUrl}/${faqManagementData.file.replace(/\\/g, '/')}`;
            console.log('Image URL:', faqManagementData['imageUrl']);
          } else {
            faqManagementData['imageUrl'] = null; // Handle cases where no file is present
          }
    
          return {
            message: 'faqManagementData successfully fetched!',
            statusCode: 201,
            faqManagementData,
          };
        } catch (error) {
          console.error('Error fetching faqManagementData:', error);
    
          return {
            message: 'An error occurred while fetching the faqManagementData',
            statusCode: 500,
            error: error.message,
          };
        }
      }
}