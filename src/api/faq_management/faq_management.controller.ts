import { Controller, Get, Post, Body, UploadedFiles, Request, Put, Param, UseInterceptors, Query } from '@nestjs/common';
import { FaqManagementService } from './faq_management.services';
import { faqManagement, faqs } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('faq_management')
@UseInterceptors(Base64Interceptor)
export class FaqManagementController {
    constructor(private readonly faqManagementService: FaqManagementService) { }

    @Post('add')
    async create(
        @Request() req: Request,
        @UploadedFiles() files: { file?: Express.Multer.File[] },
        @Body('data') data: string,
    ) {
        try {
            console.log('Request Body:', req.body);  // Log the request body
            console.log('Encrypted Data Received:', data);  // Log the encrypted data


            if (!data) {
                throw new Error('Encrypted data is missing');
            }

            // Decode base64 encoded data
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const faqManagement: Partial<faqManagement> = JSON.parse(decodedData);

            console.log('Decoded faqManagement:', faqManagement);



            if (files.file && files.file[0]) {
                faqManagement['file'] = files.file[0].path;
            }

            console.log(faqManagement, "aaaaaaaaaaaaaa")

            // Call the service to create the faqManagement
            const createdContent = await this.faqManagementService.create(faqManagement);

            // Return a success message
            return {
                message: 'faqManagement successfully added!',
                statusCode: 201,
                data: createdContent
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

    @Post('delete')
    async delete(@Body('data') data: any) {
        try {
            // Decode the encrypted data
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const faqManagement: Partial<faqManagement> = JSON.parse(decodedData);
            const id = faqManagement['id'];

            console.log(`Deleting faqManagement with id: ${id}`);

            // Validate the id
            if (!Types.ObjectId.isValid(id)) {
                return {
                    message: 'Invalid ObjectId format',
                    statusCode: 400,
                };
            }

            // Call the service to delete the faqManagement
            return this.faqManagementService.deleteFaqManagement(id);

        } catch (error) {
            console.error('Error deleting faqManagement:', error);
            return {
                message: 'An error occurred while deleting the faqManagement',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('allFaqManagement')
    async findAll(@Body('data') data: any) {
        try {

            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const faqManagement: Partial<faqManagement> = JSON.parse(decodedData);
            console.log(faqManagement, "faqManagement");

            const page = faqManagement['page'] || 1;
            const pageSize = faqManagement['pageSize'] || 10;


            const faqName = faqManagement['name'];


            return this.faqManagementService.findAll(page, pageSize, faqName);

        } catch (error) {
            console.error('Error fetching faqManagement:', error);

            return {
                message: 'An error occurred while fetching the faqManagement',
                statusCode: 500,
                error: error.message,
            };
        }
    }


    @Post('addFaq')
    async createFaq(
        @Request() req: Request,
        // @UploadedFiles() files: { file?: Express.Multer.File[]},
        @Body('data') data: string,
    ) {
        try {
            console.log('Request Body:', req.body);  // Log the request body
            console.log('Encrypted Data Received:', data);  // Log the encrypted data


            if (!data) {
                throw new Error('Encrypted data is missing');
            }

            // Decode base64 encoded data
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const faqs: Partial<faqs> = JSON.parse(decodedData);

            console.log('Decoded faqManagement:', faqs);


            // Call the service to create the faqs
            const createdContent = await this.faqManagementService.createFaq(faqs);

            // Return a success message
            return {
                message: 'faqs successfully added!',
                statusCode: 201,
                data: createdContent
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

    @Post('deleteFaq')
    async deleteFaq(@Body('data') data: any) {
        try {
            // Decode the encrypted data
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const faqManagement: Partial<faqs> = JSON.parse(decodedData);
            const id = faqManagement['id'];

            console.log(`Deleting faqManagement with id: ${id}`);

            // Validate the id
            if (!Types.ObjectId.isValid(id)) {
                return {
                    message: 'Invalid ObjectId format',
                    statusCode: 400,
                };
            }

            // Call the service to delete the faqManagement
            return this.faqManagementService.deleteFaq(id);

        } catch (error) {
            console.error('Error deleting faqManagement:', error);
            return {
                message: 'An error occurred while deleting the faqManagement',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('allFaq')
    async findAllFaq(@Body('data') data: any) {
        try {

            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const faqManagement: Partial<faqs> = JSON.parse(decodedData);
            console.log(faqManagement, "faqManagement");

            const page = faqManagement['page'] || 1;
            const pageSize = faqManagement['pageSize'] || 10;


            const faqName = faqManagement['name'];


            return this.faqManagementService.findAllFaq(page, pageSize, faqName);

        } catch (error) {
            console.error('Error fetching faqManagement:', error);

            return {
                message: 'An error occurred while fetching the faqManagement',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('update/:id')
      async update(
        @Param('id') id: string,
        @Request() req: Request,
        @UploadedFiles() files: { file?: Express.Multer.File[]; },
        @Body('data') data: string
      ) {
        try {
          console.log('Request Body:', req.body);
          console.log('Encrypted Data Received:', data);
    
          if (!data) {
            throw new Error('Encrypted data is missing or undefined');
          }
    
          let decodedData;
          try {
            decodedData = Buffer.from(data, 'base64').toString('utf-8');
            console.log('Decoded Data String:', decodedData);
          } catch (decodeError) {
            throw new Error('Failed to decode base64 data');
          }
    
          let faqManagement: Partial<faqManagement>;
          try {
            faqManagement = JSON.parse(decodedData);
            console.log('Parsed Product Updates:', faqManagement);
          } catch (parseError) {
            throw new Error('Invalid JSON in decoded data');
          }
    
          // Handle the uploaded file if exists
          if (files.file && files.file[0]) {
            faqManagement['file'] = files.file[0].path;
          }
          // Call the service to update the product
          const updatedProduct = await this.faqManagementService.updateFaqManagement(id, faqManagement);
    
          return {
            message: 'Blog successfully updated!',
            statusCode: 200,
            data: updatedProduct,
          };
        } catch (error) {
          console.error('Error updating product:', error.message);
          return {
            message: 'Error updating Blog',
            statusCode: 400,
            error: error.message,
          };
        }
      }

      // === backend/src/modules/faq_management/faq_management.controller.ts ===
// + Add this handler (leave your existing endpoints as-is)
@Post('updateFaq/:id')
async updateFaq(
  @Param('id') id: string,
  @Body('data') data?: string,
  @Body() body?: any,
) {
  try {
    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId format', statusCode: 400 };
    }

    // Accept base64 `data` or plain JSON { question, answer }
    let payload: Partial<faqs> | null = null;
    if (data) {
      try {
        const decoded = Buffer.from(data, 'base64').toString('utf-8');
        payload = JSON.parse(decoded);
      } catch {
        return { message: 'Invalid base64 `data` JSON', statusCode: 400 };
      }
    } else if (body) {
      payload = { question: body.question, answer: body.answer };
    }

    if (!payload || (!payload.question && !payload.answer)) {
      return { message: 'Nothing to update. Provide `question` and/or `answer`.', statusCode: 400 };
    }

    return await this.faqManagementService.updateFaq(id, payload);
  } catch (error: any) {
    return { message: 'Error updating FAQ', statusCode: 500, error: error.message };
  }
}


    @Post('view')
     async findOne(@Body('data') data: any) {
       try {
   
         const decodedData = Buffer.from(data, 'base64').toString('utf-8');
         const faqName: Partial<faqManagement> = JSON.parse(decodedData);
         const id = faqName['id'];
   
         console.log(`Fetching faqName with id: ${id}`);
   
         if (!Types.ObjectId.isValid(id)) {
           return {
             message: 'Invalid ObjectId format',
             statusCode: 400,
           };
         }
   
   
         return this.faqManagementService.findOneById(id);
   
       } catch (error) {
         console.error('Error fetching faq:', error);
         return {
           message: 'An error occurred while fetching the faq',
           statusCode: 500,
           error: error.message,
         };
       }
     }   

}