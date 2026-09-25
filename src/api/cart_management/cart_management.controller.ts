import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query, Response } from '@nestjs/common';
import { cartManagementService } from './cart_management.service';
import { cartManagement } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express } from 'express';

@Controller('cart_management')
@UseInterceptors(Base64Interceptor)
export class CartManagementController {
  constructor(private readonly cartManagementService: cartManagementService) { }

  @Post('addCart') //this api will work also for increase quantity or update
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
      let cartManagement: Partial<cartManagement> = JSON.parse(decodedData);

      console.log('Decoded cartManagement:', cartManagement);

      cartManagement.userId = new Types.ObjectId(cartManagement.userId);
      cartManagement.productId = new Types.ObjectId(cartManagement.productId);

      // Call the service to create the CartManagement
      const createdCartManagement = await this.cartManagementService.addCart(cartManagement);

      if (createdCartManagement?.statusCode) {
        return createdCartManagement
      } else {
        // Return a success message
        return {
          message: 'Cart successfully added!',
          statusCode: 201,
          data: createdCartManagement
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

  @Post('findUserCart')
  async findAll(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const CartManagement: Partial<cartManagement> = JSON.parse(decodedData);
      console.log(CartManagement, "CenterManagement");
      const page = CartManagement['page'] || 1;
      const pageSize = CartManagement['pageSize'] || 100;
      let userId = CartManagement['user'];
      let proId = CartManagement['product']
      let selected = CartManagement['selected']


      return this.cartManagementService.findOneById(page, pageSize, userId, proId, selected);

    } catch (error) {
      console.error('Error fetching cartManagement:', error);

      return {
        message: 'An error occurred while fetching the cartManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }

   @Post('findUserCartForNonLogin')
  async findUserCartForNonLogin(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const CartManagement: Partial<cartManagement> = JSON.parse(decodedData);
      console.log(CartManagement, "CenterManagement");
      const page = CartManagement['page'] || 1;
      const pageSize = CartManagement['pageSize'] || 10;
      let userId = CartManagement['user'];
      let proId = CartManagement['productIds']
      let selected = CartManagement['selected']


      return this.cartManagementService.findUserCartForNonLogin(page, pageSize,  proId, selected);

    } catch (error) {
      console.error('Error fetching cartManagement:', error);

      return {
        message: 'An error occurred while fetching the cartManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('delete')
  async deleteCartItem(@Body('data') data: any) {
    try {
      // Decode the encrypted data
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const cartManagement: Partial<cartManagement> = JSON.parse(decodedData);
      const id = cartManagement['id'];
      const userId = cartManagement['user_id'];

      console.log(`Deleting cart item with id: ${id}`);

      // Validate the id
      if (!Types.ObjectId.isValid(id)) {
        return {
          message: 'Invalid ObjectId format',
          statusCode: 400,
        };
      }

      // Call the service to delete the cartManagement
      return this.cartManagementService.deleteCartItem(id, userId);

    } catch (error) {
      console.error('Error deleting cart item:', error);
      return {
        message: 'An error occurred while deleting the cart item',
        statusCode: 500,
        error: error.message,
      };
    }
  }





  @Post('selectItems')
  async selectItems(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const b: any = JSON.parse(decodedData);
      let ids = b.ids;
      let user = b.user;


      return this.cartManagementService.selectItem(ids, user);



    } catch (error) {
      console.error('Error fetching cartManagement:', error);

      return {
        message: 'An error occurred while fetching the cartManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('findCartCount')
  async findCount(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const CartManagement: Partial<cartManagement> = JSON.parse(decodedData);
      console.log(CartManagement, "CenterManagement");

      let userId = CartManagement['user'];

      const count = this.cartManagementService.findCount(userId);
      return count

    } catch (error) {
      console.error('Error fetching cartManagement:', error);

      return {
        message: 'An error occurred while fetching the cartManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }


 @Post('findnonLoginUserCart')
  async findnonLoginUserCart(@Body('data') data: any) {
    try {

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const CartManagement: Partial<cartManagement> = JSON.parse(decodedData);
      console.log(CartManagement, "CenterManagement");

      let userId = CartManagement['user'];

      return this.cartManagementService.findCount(userId);

    } catch (error) {
      console.error('Error fetching cartManagement:', error);

      return {
        message: 'An error occurred while fetching the cartManagement',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('addCartForNonLogin') //this api will work also for increase quantity or update
  async addCartForNonLogin(
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
      let cartManagement: Partial<cartManagement> = JSON.parse(decodedData);

      console.log('Decoded cartManagement:', cartManagement);

      // cartManagement.userId = new Types.ObjectId(cartManagement.userId);
      // cartManagement.productId = new Types.ObjectId(cartManagement.productId);

      // Call the service to create the CartManagement
      const createdCartManagement = await this.cartManagementService.addCartForNonLogin(cartManagement);

      if (createdCartManagement?.statusCode) {
        return createdCartManagement
      } else {
        // Return a success message
        return {
          message: 'Cart successfully added!',
          statusCode: 201,
          data: createdCartManagement
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

}