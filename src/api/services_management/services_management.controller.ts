// File: services_management.controller.ts
import { Controller, Post, Body, Param, Request, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ServicesManagementService } from './services_management.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express } from 'express';

@Controller('services_management')
@UseInterceptors(Base64Interceptor)
export class ServicesManagementController {
  constructor(private readonly servicesService: ServicesManagementService) { }

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);

      if (files.file && files.file[0]) result['file'] = files.file[0].path;
      if (result.service_type && Types.ObjectId.isValid(result.service_type)) {
        result.service_type = new Types.ObjectId(result.service_type);
      }
      for (const [i, addOn] of result.add_ons.entries()) {
        console.log(addOn, i, result.add_ons)
        result.add_ons[i] = new Types.ObjectId(addOn)
      }
      for (const [i, resource] of result.resource.entries()) {
        result.resource[i] = new Types.ObjectId(resource)
      }

      for (const [i, centerId] of result.centerId.entries()) {
        result.centerId[i] = new Types.ObjectId(centerId)
      }

      result.created_at = new Date();
      result.updated_at = new Date();

      const created = await this.servicesService.create(result);
      return { message: 'Service added!', statusCode: 201, data: created };
    } catch (error) {
      console.log(error)
      return { message: 'Error', statusCode: 400, error: error.message };
    }
  }

@Post('getAll')
async findAll(@Body('data') data: any) {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const result: any = JSON.parse(decodedData);
    const page = result.page || 1;
    const pageSize = result.pageSize || 10;
    const serviceTypeId = result.service_type;
    const centerId = result.centerId; // could be array or string

    return this.servicesService.findAll(page, pageSize, serviceTypeId, centerId);
  } catch (error) {
    return { message: 'Fetch error', statusCode: 500, error: error.message };
  }
}



  @Post('view')
  async findOne(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);
      const id = result.id;

      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID', statusCode: 400 };
      return await this.servicesService.findOneById(id);
    } catch (error) {
      return { message: 'View error', statusCode: 500, error: error.message };
    }
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    try {
      if (!data) throw new Error('Missing data');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const updates: any = JSON.parse(decodedData);
      if (updates.service_type && Types.ObjectId.isValid(updates.service_type)) {
        updates.service_type = new Types.ObjectId(updates.service_type);
      }


      if (files.file && files.file[0]) updates['file'] = files.file[0].path;
      updates.updated_at = new Date();

      if (updates.centerId && Array.isArray(updates.centerId)) {
  updates.centerId = updates.centerId.map(id =>
    Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id
  );
}

if (updates.resource && Array.isArray(updates.resource)) {
  updates.resource = updates.resource.map(id =>
    Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id
  );
}

if (updates.add_ons && Array.isArray(updates.add_ons)) {
  updates.add_ons = updates.add_ons.map(id =>
    Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id
  );
}


      return await this.servicesService.updateService(id, updates);
    } catch (error) {
      return { message: 'Update error', statusCode: 400, error: error.message };
    }
  }

  @Post('delete')
  async delete(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);
      const id = result.id;

      if (!Types.ObjectId.isValid(id)) return { message: 'Invalid ID', statusCode: 400 };
      return await this.servicesService.deleteService(id);
    } catch (error) {
      return { message: 'Delete error', statusCode: 500, error: error.message };
    }
  }

  @Post('getDetailsForServiceCreate')
  async getDetailsForServiceCreate(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);

      return await this.servicesService.getDetailsForServiceCreate(result.centerId);
    } catch (error) {
      return { message: 'fatch error', statusCode: 500, error: error.message };
    }
  }

  @Post('getServiceDuration')
  async getServiceDuration(@Body('data') data: any) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const result: any = JSON.parse(decodedData);

      return await this.servicesService.getServiceDuration(result);
    } catch (error) {
      return { message: 'fatch error', statusCode: 500, error: error.message };
    }
  }

  // File: services_management.controller.ts
  @Post('toggleStatus/:id')
  async toggleStatus(@Param('id') id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return { message: 'Invalid ID', statusCode: 400 };
      }
      return await this.servicesService.toggleStatus(id);
    } catch (error) {
      return { message: 'Toggle error', statusCode: 500, error: error.message };
    }
  }

  @Post('findPriceById')
  async findById(@Request() req: Request,
    @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      let servicePrice = JSON.parse(decodedData);

      console.log('Decoded newServicePrice:', servicePrice);
      const findData = {}
      if (servicePrice.userId) {
        findData['userId'] = new Types.ObjectId(servicePrice.userId)
      }
      if (servicePrice.serviceId) {
        findData['serviceId'] = new Types.ObjectId(servicePrice.serviceId)
      }
      return this.servicesService.findPriceById(findData);
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }

  }

  @Post('getDetailsForServiceEmployee')
  async getDetailsForServiceEmployee(@Request() req: Request,
    @Body('data') data: string) {
    try {
      console.log('Request Body:', req.body);  // Log the request body
      console.log('Encrypted Data Received:', data);  // Log the encrypted data

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      let servicePrice = JSON.parse(decodedData);

      console.log('Decoded newServicePrice:', servicePrice);
      const findData = {}
     
      if (servicePrice.serviceId) {
        findData['id'] = new Types.ObjectId(servicePrice.serviceId)
      }
      return this.servicesService.getDetailsForServiceEmployee(servicePrice);
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message
      };
    }

  }

}
