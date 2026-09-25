import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
let { ObjectId } = require('mongoose').Types;
 
import { JobApplication, JobApplicationDocument, JobManagement, JobManagementSchema, JobManagementDocument } from '../../schema/schema';

@Injectable()
export class JobManagementService {
  constructor(
    @InjectModel(JobManagement.name) private jobManagementModel: Model<JobManagementDocument>,
    @InjectModel(JobApplication.name) private jobApplicationModel: Model<JobApplicationDocument>,
  ) { }

  async create1(jobManagementData: Partial<JobManagement>): Promise<JobManagement> {
    const createdJobManagement = new this.jobManagementModel(jobManagementData);
    // console.log(createdJobManagement,"createdJobManagementcreatedJobManagement",Product)
    return createdJobManagement.save();
  }

  async findAll(
    page: number,
    pageSize: number,
    jobTitle?: string,
     
  ) {
    const skip = (page - 1) * pageSize; // Calculate how many documents to skip
    const limit = pageSize;
  
    // Build the filter query
    const filter: any = {};
  
    
    // Filter by jobTitle
    if (jobTitle) {
      filter.jobTitle = jobTitle;
    }
  
     
    // Fetch coupons with pagination and filtering
    const JobManagement = await this.jobManagementModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
  
    // Get the total count of filtered coupons (for pagination metadata)
    const totalCount = await this.jobManagementModel.countDocuments(filter).exec();
  
    // Return the coupons and pagination metadata
    return {
      message: 'Coupons successfully fetched!',
      statusCode: 200,
      JobManagement,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }
  

  async findOneById(id: string): Promise<any> {  // Return type is updated to 'any' for more flexible response
    try {
      // Convert the ID to ObjectId (assuming it's already validated in the controller)
      const objectId = new Types.ObjectId(id);
  
      // Find the product by ObjectId
      const JobManagement = await this.jobManagementModel.findOne({ _id: objectId }).exec();
  
      if (!JobManagement) {
        throw new Error(`JobManagement not found with id: ${id}`);
      }
  
      // Return the JobManagement along with a success message
      return {
        message: 'JobManagement successfully fetched!',
        statusCode: 201,
        JobManagement,
      };
    } catch (error) {
      console.error('Error fetching JobManagement:', error);
  
      // Return an error response if the JobManagement is not found or there is any other error
      return {
        message: 'An error occurred while fetching the JobManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  
  async updateJobManagement(id: any, JobManagementUpdates: Partial<JobManagement>): Promise<any> {  // Return type is updated to 'any' for flexible response
    try {
      console.log(id,"AAAAAAAAAAAAAAAAAAA",JobManagementUpdates)
      const objectId = new Types.ObjectId(id);
      JobManagementUpdates.modified = new Date();
      const updatedProduct = await this.jobManagementModel.updateOne(
        {_id:objectId},
        { $set: JobManagementUpdates }, // Use `$set` to update specific fields
        { new: true, runValidators: true } // Return the updated document and validate schema
      );
  
      if (!updatedProduct) {
        return {
          message: 'Product not found with the provided id',
          statusCode: 404,
          error: `No product found with id: ${id}`,
        };
      }
  
      // Return success message with updated product
      return {
        message: 'Product successfully updated!',
        statusCode: 201,
        updatedProduct,
      };
    } catch (error) {
      console.error('Error updating product in the database:', error);
  
      // Return error response
      return {
        message: 'An error occurred while updating the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  async deleteJobManagement(id: any) {
    // The update query
    console.log(id,"uiui")
    const deleteJobManagement = await this.jobManagementModel.deleteOne(
      { _id: new ObjectId(id) },
      // data, // Return the updated document
    );
    console.log(deleteJobManagement,"deleteJobManagement")
    return {
      message: 'File deleted successfully',
      // filePath: file.path,
      };
  }

  async applyToJob(payload: {
    job_id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    availableDate?: string;
    resumeLink?: string;
  }) {
    try {
      const { job_id, firstName, lastName, email, phone, availableDate, resumeLink } = payload;

      if (!Types.ObjectId.isValid(job_id)) {
        return { message: 'Invalid job_id', statusCode: 400 };
      }

      const jobExists = await this.jobManagementModel.exists({ _id: new Types.ObjectId(job_id), is_deleted: 0 });
      if (!jobExists) {
        return { message: 'Job not found or inactive', statusCode: 404 };
      }

      const application = new this.jobApplicationModel({
        job_id: new Types.ObjectId(job_id),
        firstName,
        lastName,
        email,
        phone,
        availableDate: availableDate ? new Date(availableDate) : null,
        resumeLink,
        status: 'New',
      });

      const saved = await application.save();
      return { message: 'Application submitted', statusCode: 201, data: saved };
    } catch (error) {
      console.error('Error applying to job:', error);
      return { message: 'Failed to submit application', statusCode: 500, error: error.message };
    }
  }

  async getApplicationsByJob(job_id: string, page = 1, pageSize = 10) {
    try {
      if (!Types.ObjectId.isValid(job_id)) {
        return { message: 'Invalid job_id', statusCode: 400 };
      }
      const skip = (page - 1) * pageSize;
      const [applications, totalCount] = await Promise.all([
        this.jobApplicationModel
          .find({ job_id: new Types.ObjectId(job_id) })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean()
          .exec(),
        this.jobApplicationModel.countDocuments({ job_id: new Types.ObjectId(job_id) }),
      ]);

      return {
        message: 'Applications fetched',
        statusCode: 200,
        data: applications,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return { message: 'Failed to fetch applications', statusCode: 500, error: error.message };
    }
  }

  async updateApplicationStatus(application_id: string, status: 'New' | 'Contacted' | 'Rejected' | 'Selected') {
    try {
      if (!Types.ObjectId.isValid(application_id)) {
        return { message: 'Invalid application_id', statusCode: 400 };
      }

      const allowed = ['New', 'Contacted', 'Rejected', 'Selected'];
      if (!allowed.includes(status)) {
        return { message: 'Invalid status value', statusCode: 400 };
      }

      const updated = await this.jobApplicationModel.findByIdAndUpdate(
        new Types.ObjectId(application_id),
        { status, updatedAt: new Date() },
        { new: true },
      );

      if (!updated) {
        return { message: 'Application not found', statusCode: 404 };
      }

      return { message: 'Application status updated', statusCode: 200, data: updated };
    } catch (error) {
      console.error('Error updating application status:', error);
      return { message: 'Failed to update application status', statusCode: 500, error: error.message };
    }
  }

  async toggleJobStatus(job_id: string) {
    try {
      if (!Types.ObjectId.isValid(job_id)) {
        return { message: 'Invalid job_id', statusCode: 400 };
      }
      const job = await this.jobManagementModel.findById(job_id);
      if (!job) {
        return { message: 'Job not found', statusCode: 404 };
      }
      job.status = job.status === 1 ? 0 : 1;
      job.modified = new Date();
      await job.save();
      return { message: 'Job status updated', statusCode: 200, data: job };
    } catch (error) {
      console.error('Error toggling job status:', error);
      return { message: 'Failed to update job status', statusCode: 500, error: error.message };
    }
  }



}