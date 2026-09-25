import { Controller, Get, Post, Body, UploadedFile, Request, Put, Param, UseInterceptors, Query , Res} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Coupon } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Response } from 'express';
import { Types } from 'mongoose'; 


@Controller('Coupon')
@UseInterceptors(Base64Interceptor)
export class CouponController {
  constructor(private readonly couponServices: CouponService) { }

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
      const coupon: Partial<Coupon> = JSON.parse(decodedData);

      console.log('Decoded coupon:', coupon);

      // Call the service to create the coupon
      const createdcoupon = await this.couponServices.create1(coupon);

      // Return a success message
      return {
        message: 'coupon successfully added!',
        statusCode: 201,
        data: createdcoupon
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

  @Post('allCoupons')
  async findAll(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const product: Partial<Coupon> = JSON.parse(decodedData);
      console.log(product, "product");
  
      // Extract pagination parameters
      const page = product['page'] || 1; // Default to page 1
      const pageSize = product['pageSize'] || 10; // Default to 10 items per page
  
      const title = product['title'];
  
      // Extract date range filters
      const startDateTime = product['startDateTime'] || null;
      const expiryDate = product['expiryDate'] || null;
      
  
      // Fetch all coupons with pagination and filtering
      return this.couponServices.findAll(page, pageSize, title, startDateTime, expiryDate);
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
      const coupon: Partial<Coupon> = JSON.parse(decodedData);
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
      return this.couponServices.findOneById(id);

    } catch (error) {
      console.error('Error fetching coupon:', error);
      return {
        message: 'An error occurred while fetching the coupon',
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
      const couponUpdates: Partial<Coupon> = JSON.parse(decodedData);

      console.log('Decoded Updates:', couponUpdates);

      let id = couponUpdates['_id']

      // Call the service to update the product
      const updatedProduct = await this.couponServices.updateProduct(id, couponUpdates);

      // Return the success response
      return {
        message: 'Product successfully updated!',
        statusCode: 200,
        data: updatedProduct,
      };

    } catch (error) {
      console.error('Error updating product:', error);
      return {
        message: 'Error updating product',
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
      const coupon: Partial<Coupon> = JSON.parse(decodedData);
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
      return this.couponServices.deleteCoupon(id);

    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        message: 'An error occurred while deleting the product',
        statusCode: 500,
        error: error.message,
      };
    }
  }


  @Post('applyCoupon')
  async applyCoupon(@Body('data') data: string) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const couponData= JSON.parse(decodedData);
      const couponCode = couponData['couponCode'];
      const userId = couponData['userId'];
      console.log(`Applying coupon: ${couponCode}`);

      if (!couponCode) {
        return {
          message: 'Coupon code is required',
          statusCode: 404,
        };
      }

      // Fetch the coupon by couponCode
      return this.couponServices.applyCouponByCode(couponCode,userId);

    } catch (error) {
      console.error('Error applying coupon:', error);
      return {
        message: 'An error occurred while applying the coupon',
        statusCode: 500,
        error: error.message,
      };
    }
  }


@Post('download-excel')
async downloadExcel(
  @Body('data') data: string,
  @Res() res: Response   // ✅ NO passthrough
): Promise<void> {
  try {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const payload = JSON.parse(decodedData);
    const id = payload['id'];

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid ObjectId format' });
      return;
    }

    await this.couponServices.downloadCouponExcel(id, res); // ✅ no return

  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Error while generating excel',
        error: error.message,
      });
    }
  }
}





}