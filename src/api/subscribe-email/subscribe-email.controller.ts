// subscribe-email.controller.ts

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Request,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';

import { Request as ExpressRequest ,Express} from 'express';

import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';

import { GroupForEmailService } from './subscribe-email.service';

import { GroupForEmail } from '../../schema/schema';
import { Types } from 'mongoose';

@Controller('group-for-email')
export class GroupForEmailController {
    constructor(
        private readonly groupForEmailService: GroupForEmailService,
    ) { }

    // ================= ADD GROUP =================

    @Post('add-group')
    @UseInterceptors(Base64Interceptor)
    async addGroup(
        @Request() req: ExpressRequest,
        @Body('data') data: string,
    ) {
        try {
            if (!data) {
                throw new HttpException(
                    'Encrypted data is missing',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const decodedData = Buffer.from(
                data,
                'base64',
            ).toString('utf-8');

            const groupData: Partial<GroupForEmail> =
                JSON.parse(decodedData);

            const createdGroup =
                await this.groupForEmailService.addGroup(
                    groupData,
                );

            return {
                message: 'Group successfully added!',
                statusCode: 201,
                data: createdGroup,
            };
        } catch (error) {
            throw new HttpException(
                error.message ||
                'Invalid encrypted data format or server error',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ================= GET ALL GROUPS =================

    @Get('group-list')
    async getAllGroups() {
        console.log("dasdasdsaddasdasds")
        try {
            const data =
                await this.groupForEmailService.getAllGroups();

            return {
                message:
                    'Group list fetched successfully!',
                statusCode: 200,
                data,
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Server Error',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ================= GET SINGLE GROUP =================

    @Get('group-details/:id')
    async getSingleGroup(
        @Param('id') id: string,
    ) {
        try {
            const data =
                await this.groupForEmailService.getSingleGroup(
                    id,
                );

            return {
                message:
                    'Group details fetched successfully!',
                statusCode: 200,
                data,
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Server Error',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ================= CONTROLLER =================

    @Post('update-group')
    async updateGroup(@Body('data') data: string) {
        try {
            // Decode Base64 request data
            const decodedData = Buffer.from(
                data,
                'base64',
            ).toString('utf-8');

            const updatedData = JSON.parse(decodedData);

            console.log('Updated Data:', updatedData);

            const groupId = updatedData.id;

            // Validate ID
            if (
                !groupId ||
                !Types.ObjectId.isValid(groupId)
            ) {
                return {
                    message: 'Valid Group ID is required',
                    statusCode: 400,
                };
            }

            // Call Service
            const result =
                await this.groupForEmailService.updateGroup(
                    groupId,
                    updatedData,
                );

            // Not Found
            if (!result) {
                return {
                    message: 'Group not found',
                    statusCode: 404,
                };
            }

            // Success
            return {
                message: 'Group updated successfully',
                statusCode: 200,
                data: result,
            };
        } catch (error) {
            console.error(
                'Error updating group:',
                error,
            );

            return {
                message:
                    'An error occurred while updating the group',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('delete-group')
    async deleteGroup(@Body('data') data: string) {
        try {
            // Decode Base64 request data
            const decodedData = Buffer.from(
                data,
                'base64',
            ).toString('utf-8');

            // Convert JSON string to object
            const requestData = JSON.parse(
                decodedData,
            );

            console.log(
                'Request Data:',
                requestData,
            );

            // GET ID
            const groupId = requestData.id;

            if (!groupId) {
                return {
                    message:
                        'Group ID is required',
                    statusCode: 400,
                };
            }

            const result =
                await this.groupForEmailService.deleteGroup(
                    groupId,
                );

            if (!result) {
                return {
                    message:
                        'Group not found',
                    statusCode: 404,
                };
            }

            return {
                message:
                    'Group deleted successfully',
                statusCode: 200,
            };
        } catch (error) {
            console.error(
                'Error deleting group:',
                error,
            );

            return {
                message:
                    'An error occurred while deleting the group',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    // subscribe-email.controller.ts

    // ================= ADD EMAIL IN GROUP =================

    @Post('add-email-in-group')
    @UseInterceptors(Base64Interceptor)
    async addEmailInGroup(
        @Body('data') data: string,
    ) {
        try {
            // CHECK DATA
            if (!data) {
                return {
                    message:
                        'Encoded data is missing',
                    statusCode: 400,
                };
            }

            // DECODE BASE64
            const decodedData = Buffer.from(
                data,
                'base64',
            ).toString('utf-8');

            console.log(
                'Decoded String:',
                decodedData,
            );

            // PARSE JSON
            const emailData = JSON.parse(
                decodedData,
            );

            console.log(
                'Parsed Data:>>>>>>>>>>>>>>>>>>>>>>>',
                emailData,
            );

            const createdData =
                await this.groupForEmailService.addEmailInGroup(
                    emailData,
                );

            return {
                message:
                    'Email successfully added in group!',
                statusCode: 201,
                data: createdData,
            };
        } catch (error) {
            console.error(
                'Controller Error:',
                error,
            );

            return {
                message:
                    error.message ||
                    'Server Error',
                statusCode: 500,
            };
        }
    }

    @Post('add-bulk-emails-in-group')
@UseInterceptors(Base64Interceptor)
async addBulkEmailsInGroup(
    @Body('data') data: string,
) {
    try {
        if (!data) {
            return {
                message: 'Encoded data is missing',
                statusCode: 400,
            };
        }

        const decodedData = Buffer.from(
            data,
            'base64',
        ).toString('utf-8');

        console.log('Decoded String:', decodedData);

        const parsedData = JSON.parse(decodedData);

        console.log('Parsed Data:', parsedData);

        const result =
            await this.groupForEmailService.addBulkEmailsInGroup(
                parsedData,
            );

        return {
            message: 'Emails successfully added in group!',
            statusCode: 201,
            data: result,
        };
    } catch (error) {
        console.error('Controller Error:', error);

        return {
            message: error.message || 'Server Error',
            statusCode: 500,
        };
    }
}


  @Post('remove-user-from-group')
@UseInterceptors(Base64Interceptor)
async removeUserFromGroup(@Body('data') data: string) {
    try {
        if (!data) {
            return { statusCode: 400, message: 'Encoded data is missing' };
        }

        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        const parsed = JSON.parse(decodedData);

        // Interceptor wraps in { data: { group, userId } } — unwrap it
        const parsedData: { group: string; userId: string } = parsed?.data ?? parsed;

        if (!parsedData?.group || !parsedData?.userId) {
            return { statusCode: 400, message: 'group and userId are required' };
        }

        const result = await this.groupForEmailService.removeUserFromGroup(parsedData);

        return {
            statusCode: 200,
            message: result.message,
            data: result,
        };

    } catch (error) {
        return {
            statusCode: 400,
            message: error.message || 'Failed to remove user from group',
        };
    }
}
    // ================= GET EMAILS BY GROUP ID =================



    @Post('group-emails')
    @UseInterceptors(Base64Interceptor)
    async getEmailsByGroupId(
        @Body('data') data: string,
    ) {
        try {
            if (!data) {
                throw new HttpException(
                    'Encrypted data is missing',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const decodedData = Buffer.from(
                data,
                'base64',
            ).toString('utf-8');

            const requestData =
                JSON.parse(decodedData);

            console.log(
                'Request Data:',
                requestData.groupId,
            );

            const result =
                await this.groupForEmailService.getEmailsByGroupId(
                    requestData.groupId,
                );

            return {
                message:
                    'Group emails fetched successfully!',
                statusCode: 200,
                data: result,
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Server Error',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // ================= SEND MAIL TO GROUP API =================

    @Post('send-mail-to-group')
    @UseInterceptors(Base64Interceptor)
    async sendMailToGroup(
        @Body('data') data: string,
    ) {
        try {

            if (!data) {
                throw new HttpException(
                    'Encrypted data is missing',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // ================= DECODE BASE64 =================

            const decodedData = Buffer
                .from(data, 'base64')
                .toString('utf-8');

            const requestData =
                JSON.parse(decodedData);

            // ================= SEND MAIL =================

            const result =
                await this.groupForEmailService.sendMailToGroup(
                    requestData,
                );

            return {
                success: true,
                message:
                    'Emails sent successfully!',
                statusCode: 200,
                data: result,
            };

        } catch (error) {

            throw new HttpException(
                error.message || 'Server Error',
                error.status ||
                HttpStatus.BAD_REQUEST,
            );
        }
    }

@Post('uploadEmailImage')
@UseInterceptors(Base64Interceptor)
  async uploadEmailImage(
    @Request() req: ExpressRequest,
    @UploadedFiles() files: { file?: Express.Multer.File[]; },
    @Body('data') data: string,
  ) {
    try {
        console.log(req.body,"kkk")
        console.log(files,"data")
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      console.log(decodedData,"decodedData")
      const emailImage = JSON.parse(decodedData);
      if (files.file && files.file[0]) emailImage['file'] = files.file[0].path;
      console.log(emailImage,"emailImage")
    //   if (files.coverImage && files.coverImage[0]) eventData['coverImage'] = files.coverImage[0].path;
    //   if (files.icon_file && files.icon_file[0]) eventData['icon_file'] = files.icon_file[0].path;

      const createdImagePath = await this.groupForEmailService.uploadEmailImage(emailImage);

      return {
        message: 'Image successfully added!',
        statusCode: 201,
        data: createdImagePath,
      };
    } catch (error) {
      console.error('Error adding event:', error);
      return { message: 'Error adding event', statusCode: 400, error: error.message };
    }
  }
}