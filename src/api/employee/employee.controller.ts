import { Controller, Get, Post, Body, Request, Put, Param, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { EmployeeManagementService } from './employee.services';
import { Employee, EmployeeSchema } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { Types } from 'mongoose';

@Controller('employee-management')
@UseInterceptors(Base64Interceptor)
export class EmployeeManagementController {
  constructor(private readonly employeeManagementService: EmployeeManagementService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const employee: Partial<Employee> = JSON.parse(decodedData);

      // attach uploaded image path (to be saved on User.file in service)
      if (files?.file && files.file[0]) {
        (employee as any)['file'] = files.file[0].path;
      }

      console.log(EmployeeSchema.path('salary'));
      const createdEnquiry = await this.employeeManagementService.create(employee);




      if (createdEnquiry['status']) {
        return {
          message: 'Employee successfully added!',
          statusCode: 201,
          data: createdEnquiry
        };
      } else {
        return {
          message: createdEnquiry['message'],
          statusCode: 500,
          data: createdEnquiry
        };
      }
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }
  }

  @Post('findAll')
  async findAll(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      const search = requestData.search || "";  // 🔥 NEW: search value
      if (requestData.centerId) {

      }

      const employees = await this.employeeManagementService.findAll(search);

      return {
        message: 'Employee data fetched successfully',
        statusCode: 200,
        data: employees
      };
    } catch (error) {
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }
  }

  @Post('findById')
  async findById(@Request() req: Request, @Body('data') data: string) {
    try {


      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const id: Partial<Employee> = JSON.parse(decodedData);



      const createdEnquiry = await this.employeeManagementService.findById(id);

      return {
        message: 'Employee successfully added!',
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

  @Post('deleteEmployee')
  async deleteEmployee(@Request() req: Request, @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      console.log(decodedData, "decodedData")
      const id: Partial<Employee> = JSON.parse(decodedData);

      console.log('Decoded Enquiry:', id);

      const createdEnquiry = await this.employeeManagementService.deleteEmployee(id);

      return {
        message: 'Employee successfully deleted',
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

  @Post('editEmployee/:id')
  async editEmployee(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string
  ) {
    try {
      console.log('ID:', id);
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) throw new Error('Encrypted data is missing');

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const employeeData: Partial<Employee> = JSON.parse(decodedData);

      // Attach file path if uploaded
      if (files?.file && files.file[0]) {
        employeeData['file'] = files.file[0].path;
      }

      console.log('Decoded employee updates:', employeeData);

      // Update employee record
      const updatedEmployee = await this.employeeManagementService.updateEmployee(
        id,
        employeeData
      );

      if (!updatedEmployee.status) {
        return {
          message: updatedEmployee.message || 'Employee not found or update failed',
          statusCode: 404,
        };
      }

      return {
        message: 'Employee successfully updated!',
        statusCode: 200,
        data: updatedEmployee.data,
      };
    } catch (error) {
      console.error('Error decoding or updating employee:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message,
      };
    }
  }


  @Post('findByUserId')
  async findByUserId(@Request() req: Request, @Body('data') data: string) {
    try {
      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData = JSON.parse(decodedData);

      if (!parsedData.userId) {
        throw new Error('userId is required');
      }

      const employeeData = await this.employeeManagementService.findByUserId(parsedData.userId);

      return {
        message: employeeData.status
          ? 'Employee fetched successfully.'
          : employeeData.message,
        statusCode: employeeData.status ? 200 : 404,
        data: employeeData,
      };
    } catch (error) {
      console.error('Error in findByUserId:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message,
      };
    }
  }


  @Post('toggleStatus')
  async toggleEmployeeStatus(@Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decodedData);

      const employeeId = parsed.id;

      if (!Types.ObjectId.isValid(employeeId)) {
        return { message: 'Invalid employee ID', statusCode: 400 };
      }

      const result = await this.employeeManagementService.toggleStatus(employeeId);

      return {
        message: result.message,
        statusCode: 200,
        data: result.data
      };
    } catch (error) {
      return {
        message: 'Error toggling employee status',
        statusCode: 500,
        error: error.message
      };
    }
  }

  @Post('addNonMemberaddress')
  async addNonMemberaddress(@Request() req: Request, @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const suscribeData = JSON.parse(decodedData);

      console.log('Decoded Address Data:', suscribeData);

      if (!suscribeData.employee_id) {
        throw new Error('employee_id is required');
      }

      if (!Types.ObjectId.isValid(suscribeData.employee_id as any)) {
        throw new Error('Invalid employee_id format');
      }

      const createdAddress = await this.employeeManagementService.addNonMemberAddress(suscribeData);

      return {
        message: 'Address added successfully!',
        statusCode: 201,
        data: createdAddress,
      };
    } catch (error) {
      console.error('Error processing address data:', error);
      return {
        message: 'Invalid data format or server error.',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('allNonMemberAddress')
  async getAllNonMemberAddress(@Body('data') data: string) {
    try {
      // Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');

      const result = await this.employeeManagementService.getAllNonMemberAddresses(JSON.parse(decodedData)?.user);
      return {

        statusCode: 201,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return {
        message: 'An error occurred while fetching addresses',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('deleteNonMemberAddress')
  async deleteNonMemberAddress(@Body('data') data: string) {
    try {
      // Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const requestData = JSON.parse(decodedData);

      console.log('Request Data:', requestData);

      const addressId = requestData.addressId;
      if (!addressId) {
        return { message: 'Address ID is required', statusCode: 400 };
      }

      const result = await this.employeeManagementService.deleteNonMemberAddress(addressId);

      if (!result) {
        return { message: 'Address not found or already deleted', statusCode: 404 };
      }

      return { message: 'Address deleted successfully', statusCode: 200 };
    } catch (error) {
      console.error('Error deleting address:', error);
      return {
        message: 'An error occurred while deleting the address',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('editNonMemberAddress')
  async editNonMemberAddress(@Body('data') data: string) {
    try {
      // Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const updatedData = JSON.parse(decodedData);

      console.log('Updated Data:', updatedData);

      const addressId = updatedData.id;
      if (!addressId || !Types.ObjectId.isValid(addressId)) {
        return { message: 'Valid Address ID is required', statusCode: 400 };
      }

      const result = await this.employeeManagementService.editNonMemberAddress(addressId, updatedData);

      if (!result) {
        return { message: 'Address not found', statusCode: 404 };
      }

      return { message: 'Address updated successfully', statusCode: 200, data: result };
    } catch (error) {
      console.error('Error updating address:', error);
      return {
        message: 'An error occurred while updating the address',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('getCenterWiseEmployee')
  async getCenterWiseEmployee(@Body('data') data: string) {
    try {
      // Decode Base64 request data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const centerData = JSON.parse(decodedData);

      console.log('Updated Data:', centerData);


      const result = await this.employeeManagementService.getCenterWiseEmployee(centerData);

      if (!result) {
        return { message: 'Address not found', statusCode: 404 };
      }

      return { message: 'Address updated successfully', statusCode: 200, data: result };
    } catch (error) {
      console.error('Error updating address:', error);
      return {
        message: 'An error occurred while updating the address',
        statusCode: 500,
        error: error.message,
      };
    }
  }



  @Post('practitionersMoveToUser')
  async moveToUser(@Request() req: Request, @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      console.log(decodedData, "decodedData")
      const id: Partial<Employee> = JSON.parse(decodedData);

      console.log('Decoded Enquiry:', id);

      const createdEnquiry = await this.employeeManagementService.moveToUser(id);

      return {
        message: 'Employee successfully Moved to user',
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


  @Post('userMoveToPractitioner')
  async moveToPractitioner(@Request() req: Request, @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      console.log(decodedData, "decodedData")
      const id: Partial<Employee> = JSON.parse(decodedData);

      console.log('Decoded Enquiry:', id);

      const createdEnquiry = await this.employeeManagementService.moveToPractitioner(id);

      return {
        message: 'Employee successfully Moved to user',
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

 @Post('addPractitioner')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
  ]),
)
async addPractitioner(
  @UploadedFiles() files: { file?: Express.Multer.File[] },
  @Body('data') data: string,
) {
  try {
    console.log('body =>', data);

    if (!data) {
      throw new Error('data field is missing');
    }

    const decodedData = Buffer.from(
      data,
      'base64',
    ).toString('utf8');

    const practitionerData =
      JSON.parse(decodedData);

    const payload = {
      ...practitionerData,
      file: files?.file?.[0]?.filename || '',
    };

    return await this.employeeManagementService.addPractitioner(
      payload,
    );
  } catch (error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }
}



}