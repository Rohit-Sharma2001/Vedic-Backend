// enquiry_management.controller.ts
import { Controller, Get, Post, Body, Request, Put, Param, UseInterceptors } from '@nestjs/common';
import { EnquiryManagementService } from './enquiry_management.services';
import { Enquiry } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('enquiry_management')
@UseInterceptors(Base64Interceptor)
export class EnquiryManagementController {
    constructor(private readonly enquiryManagementService: EnquiryManagementService) { }

    @Post('add')
    async create(@Request() req: Request, @Body('data') data: string) {
        try {
            console.log('Request Body:', req.body);
            console.log('Encrypted Data Received:', data);

            if (!data) {
                throw new Error('Encrypted data is missing');
            }

            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const enquiry: Partial<Enquiry> = JSON.parse(decodedData);

            console.log('Decoded Enquiry:', enquiry);

            const createdEnquiry = await this.enquiryManagementService.create(enquiry);

            return {
                message: 'Enquiry successfully added!',
                statusCode: 201,
                data: createdEnquiry
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
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const enquiry: Partial<Enquiry> = JSON.parse(decodedData);
            const id = enquiry['id'];

            console.log(`Deleting enquiry with id: ${id}`);

            if (!Types.ObjectId.isValid(id)) {
                return {
                    message: 'Invalid ObjectId format',
                    statusCode: 400,
                };
            }

            return this.enquiryManagementService.deleteEnquiry(id);

        } catch (error) {
            console.error('Error deleting enquiry:', error);
            return {
                message: 'An error occurred while deleting the enquiry',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('allEnquiries')
    async findAllEnquiries(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const enquiryData: Partial<Enquiry> = JSON.parse(decodedData);
            console.log(enquiryData, "enquiryData");

            const page = enquiryData['page'] || 1;
            const pageSize = enquiryData['pageSize'] || 10;

            return this.enquiryManagementService.findAllEnquiries(page, pageSize);

        } catch (error) {
            console.error('Error fetching enquiries:', error);
            return {
                message: 'An error occurred while fetching the enquiries',
                statusCode: 500,
                error: error.message,
            };
        }
    }
}
