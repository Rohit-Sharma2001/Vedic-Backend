import { Controller, Get, Post, Body, UploadedFile, Request, Put, Param, UseInterceptors, Query } from '@nestjs/common';
import { JobManagementService } from './job_management.service';
import { JobManagement } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('job_management')
@UseInterceptors(Base64Interceptor)
export class JobManagementController {
  constructor(private readonly jobManagementServices: JobManagementService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const JobManagement: Partial<JobManagement> = JSON.parse(decodedData);

      console.log('Decoded JobManagement:', JobManagement);

      // Call the service to create the JobManagement
      const createdJobManagement = await this.jobManagementServices.create1(JobManagement);

      // Return a success message
      return {
        message: 'JobManagement successfully added!',
        statusCode: 201,
        data: createdJobManagement
      };
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }
  }

  @Post('allJobs')
  async findAll(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const JobManagement: Partial<JobManagement> = JSON.parse(decodedData);
      console.log(JobManagement, "JobManagement");
  
      // Extract pagination parameters
      const page = JobManagement['page'] || 1; // Default to page 1
      const pageSize = JobManagement['pageSize'] || 10; // Default to 10 items per page
  
      const jobTitle = JobManagement['jobTitle'];
  
      // Fetch all coupons with pagination and filtering
      return this.jobManagementServices.findAll(page, pageSize, jobTitle);
    } catch (error) {
      console.error('Error fetching coupons:', error);
  
      // Return an error response
      return {
        message: 'An error occurred while fetching the coupons',
        statusCode: 500,
        error: error.message,
      };
    }
  }
  

  @Post('view')
  async findOne(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const JobManagement: Partial<JobManagement> = JSON.parse(decodedData);
      const id = JobManagement['id'];

      console.log(`Fetching JobManagement with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Fetch the JobManagement by id
      return this.jobManagementServices.findOneById(id);

    } catch (error) {
      console.error('Error fetching JobManagement:', error);
      return {
        message: 'An error occurred while fetching the JobManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('update')
  async update(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode and parse the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const JobManagementUpdates: Partial<JobManagement> = JSON.parse(decodedData);

      console.log('Decoded Updates:', JobManagementUpdates);

      let id = JobManagementUpdates['_id']

      // Call the service to update the product
      const updatedJobManagement = await this.jobManagementServices.updateJobManagement(id, JobManagementUpdates);

      // Return the success response
      return {
        message: 'Job Management successfully updated!',
        statusCode: 200,
        data: updatedJobManagement,
      };

    } catch (error) {
      console.error('Error updating product:', error);
      return {
        message: 'Error updating Job Management',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('delete')
  async deleteProduct(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const JobManagement: Partial<JobManagement> = JSON.parse(decodedData);
      const id = JobManagement['id'];

      console.log(`Deleting JobManagement with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Call the service to delete the JobManagement
      return this.jobManagementServices.deleteJobManagement(id);

    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        message: 'An error occurred while deleting the Job Management',
        statusCode: 500,
        error: error.message,
      };
    }
  }

 @Post('apply')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads/resumes', // ensure this folder exists & is served statically
    filename: (_req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + extname(file.originalname));
    },
  }),
  fileFilter: (_req, file, cb) => {
    // accept only PDFs
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}))

async apply(@UploadedFile() file: Express.Multer.File, @Body('data') data: string) {
  try {
    if (!data) {
      return { message: 'Missing data', statusCode: 400 };
    }
    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);

    // Accept both phone/phoneNumber, job_id/jobId for robustness
    const job_id = payload.job_id || payload.jobId;
    const phone = payload.phone || payload.phoneNumber;

    const { firstName, lastName, email, availableDate } = payload;

    // If file uploaded, build resumeLink (adjust URL base as needed)
    const resumeLink = payload.resumeLink || (file ? `/uploads/resumes/${file.filename}` : undefined);

    return this.jobManagementServices.applyToJob({
      job_id,
      firstName,
      lastName,
      email,
      phone,
      availableDate,
      resumeLink,
    });
  } catch (error) {
    console.error('Error applying to job:', error);
    return { message: 'Server error', statusCode: 500, error: error.message };
  }
}

  @Post('applications')
  async applicationsByJob(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const { job_id, page = 1, pageSize = 10 } = payload;
      return this.jobManagementServices.getApplicationsByJob(job_id, page, pageSize);
    } catch (error) {
      console.error('Error fetching applications:', error);
      return { message: 'Server error', statusCode: 500, error: error.message };
    }
  }

  @Post('applicationStatus')
  async updateApplicationStatus(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const { application_id, status } = payload;
      return this.jobManagementServices.updateApplicationStatus(application_id, status);
    } catch (error) {
      console.error('Error updating application status:', error);
      return { message: 'Server error', statusCode: 500, error: error.message };
    }
  }

  @Post('toggleJobStatus')
  async toggleJobStatus(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const { job_id } = payload;
      return this.jobManagementServices.toggleJobStatus(job_id);
    } catch (error) {
      console.error('Error updating job status:', error);
      return { message: 'Server error', statusCode: 500, error: error.message };
    }
  }






}