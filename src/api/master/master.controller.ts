import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query } from '@nestjs/common';
import { MasterService } from './master.service';
import { Master, suscribe } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';

@Controller('Master')
@UseInterceptors(Base64Interceptor)
export class MasterController {
  constructor(private readonly masterServices: MasterService) { }

  // category
  @Post('add')
  async createCategory(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[]; icon_file?: Express.Multer.File[] },
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const category: Partial<Master> = JSON.parse(decodedData);

      console.log('Decoded category:', category);

      // Convert category_id to ObjectId if it exists
      if (category.category_id) {
        category.category_id = new ObjectId(category.category_id);
      }

      // Attach file paths to the category if uploaded
      if (files.file && files.file[0]) {
        category['file'] = files.file[0].path;
      }

      if (files.icon_file && files.icon_file[0]) {
        category['icon_file'] = files.icon_file[0].path;
      }

      // Call the service to create the category
      const createdCategory = await this.masterServices.createCategory(category);

      // Return a success message
      return {
        message: 'category successfully added!',
        statusCode: 201,
        data: createdCategory,
      };
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('add-suscribe')
  async addSuscribe(
    @Request() req: Request,
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const suscribeData: Partial<suscribe> = JSON.parse(decodedData);

      console.log('Decoded Subscription Data:', suscribeData);

      // Call the service to create the subscription
      const createdSubscription = await this.masterServices.addSuscribe(suscribeData);

      // Return a success message
      return {
        message: 'Email subscribed successfully!',
        statusCode: 201,
        data: createdSubscription,
      };
    } catch (error) {
      console.error('Error decoding or parsing encrypted data:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  // ── controllers/master.controller.ts ───────────────────────────────────────
@Post('all-suscribe')
async getAllSuscribers(@Body('data') data: string) {
  try {
    if (!data) throw new Error('Encrypted data is missing');

    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);

    const page = Number(payload.page) || 1;
    const pageSize = Number(payload.pageSize) || 10;
    const search = (payload.search || '').trim();

    return await this.masterServices.findAllSuscribers(page, pageSize, search);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return {
      message: 'An error occurred while fetching the subscribers',
      statusCode: 500,
      error: error.message,
    };
  }
}

// @Post('update-subscribe-email')
// async updateSubscriberEmail(
//   @Body('_id') id: string,
//   @Body('email') email: string,
// ) {
//   return this.masterServices.updateSubscriberEmail(id, email);
// }

@Post('update-subscribe-email')
async updateSubscriberEmail(@Body('data') data: string) {
  try {
    if (!data) throw new Error('Encrypted data is missing');

    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);

    const id = payload._id;
    const email = payload.email;

    if (!id || !email) {
      throw new Error('_id and email are required');
    }

    return await this.masterServices.updateSubscriberEmail(id, email);
  } catch (error) {
    console.error('Error updating subscriber email:', error);

    return {
      message: 'An error occurred while updating subscriber email',
      statusCode: 500,
      error: error.message,
    };
  }
}

// controllers/master.controller.ts  ✅ ADD
@Post('delete-suscribe')
async deleteSuscribe(@Body('data') data: string) {
  try {
    if (!data) throw new Error('Encrypted data is missing');

    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);
    const id = payload['id'];

    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId format', statusCode: 400 };
    }

    const res = await this.masterServices.deleteSuscriber(id);
    return res;
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return {
      message: 'An error occurred while deleting the subscriber',
      statusCode: 500,
      error: error.message,
    };
  }
}


  @Post('allData')
  async findAll(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const master: Partial<Master> = JSON.parse(decodedData);

      const page = master['page'] || 1;
      const pageSize = master['pageSize'] || 10;
      const dropdown_type = master['dropdown_type'];
      // Assign category_id if present; otherwise, set it to an empty string
      const category_id = master.category_id ? master.category_id : '';

      // Call the service with category_id if provided
      return await this.masterServices.findAll(page, pageSize, dropdown_type, category_id,master.status);
    } catch (error) {
      console.error('Error fetching data:', error);

      // Return an error response
      return {
        message: 'An error occurred while fetching the data',
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
      const coupon: Partial<Master> = JSON.parse(decodedData);
      const id = coupon['id'];

      console.log(`Fetching coupon with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Fetch the coupon by id
      return this.masterServices.findOneById(id);

    } catch (error) {
      console.error('Error fetching coupon:', error);
      return {
        message: 'An error occurred while fetching the coupon',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('update/:id')
  async updateCategory(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[]; icon_file?: Express.Multer.File[] },
    @Body('data') data: string
  ) {
    try {
      console.log('ID:', id);
      console.log('Request Body:', req.body);
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing');
      }

      // Decode base64 encoded data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const categoryUpdates: Partial<Master> = JSON.parse(decodedData);

      console.log('Decoded category updates:', categoryUpdates);

      // Convert category_id to ObjectId if it exists
      if (categoryUpdates.category_id) {
        categoryUpdates.category_id = new ObjectId(categoryUpdates.category_id);
      }

      // Attach updated file paths to the category if new files are uploaded
      if (files.file && files.file[0]) {
        categoryUpdates['file'] = files.file[0].path;
      }

      if (files.icon_file && files.icon_file[0]) {
        categoryUpdates['icon_file'] = files.icon_file[0].path;
      }

      // Call the service to update the category
      const updatedCategory = await this.masterServices.updateCategory(id, categoryUpdates);

      if (!updatedCategory) {
        return {
          message: 'Category not found or update failed',
          statusCode: 404,
        };
      }

      // Return a success message
      return {
        message: 'Category successfully updated!',
        statusCode: 200,
        data: updatedCategory,
      };
    } catch (error) {
      console.error('Error decoding or updating category:', error);
      return {
        message: 'Invalid encrypted data format or server error.',
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
      const coupon: Partial<Master> = JSON.parse(decodedData);
      const id = coupon['id'];

      console.log(`Deleting coupon with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }
     
      // Call the service to delete the coupon
      return this.masterServices.deleteData(id);

    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        message: 'An error occurred while deleting the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('subcategory')
  async findSubCat(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const subcategory: Partial<Master> = JSON.parse(decodedData);
      const category_id = subcategory['category_id'];

      console.log(`Fetching subcategory with id: ${category_id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(category_id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Fetch the subcategory by id
      return this.masterServices.findSubcategory(category_id);


    } catch (error) {
      console.error('Error fetching subcategory:', error);
      return {
        message: 'An error occurred while fetching the subcategory',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  // controllers/master.controller.ts

  @Post('getSubCategoryBasedOnCategory')
  async getSubCategoryBasedOnCategory(@Body('data') data: string) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decodedData);
      const category_ids: string[] = payload['category_ids'];

      console.log(`Fetching subcategories for category_ids: ${category_ids}`);

      // Validate the array
      if (!Array.isArray(category_ids) || category_ids.length === 0) {
        return {
          message: 'category_ids must be a non-empty array',
          statusCode: 400,
        };
      }

      return await this.masterServices.getSubCategoryBasedOnCategory(category_ids);

    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return {
        message: 'An error occurred while fetching the subcategories',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('searchByNameAndDescription')
  async searchByNameAndDescription(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const category = JSON.parse(decodedData);
      // Fetch the subcategory by id
      return this.masterServices.searchByNameAndDescription(category.search,category.dropdown_type);

    } catch (error) {
      console.error('Error fetching category:', error);
      return {
        message: 'An error occurred while fetching the category',
        statusCode: 500,
        error: error.message,
      };
    }
  }


@Post('toggleStatus')
async toggleStatus(@Body('data') data: any) {
  try {
    // Decode Base64 data
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const parsedData = JSON.parse(decodedData);
    const id = parsedData['id'];

    console.log(`Toggling status for record with id: ${id}`);

    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    // Call the service
    const response = await this.masterServices.toggleStatus(id);

    return response;
  } catch (error) {
    console.error('Error toggling status:', error);
    return {
      message: 'An error occurred while toggling status',
      statusCode: 500,
      error: error.message,
    };
  }
}






}