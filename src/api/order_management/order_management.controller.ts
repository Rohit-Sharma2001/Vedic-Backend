import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query, Res } from '@nestjs/common';
import { OrderManagementService } from './order_management.service';
import { orderManagement } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express, Response } from 'express';
import { userInfo } from 'os';
// import {  } from 'express';
@Controller('order-management')
@UseInterceptors(Base64Interceptor)
export class OrderManagementController {
    constructor(private readonly orderManagementService: OrderManagementService) { }

    @Post('addOrder')
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
            let orderManagement: Partial<orderManagement> = JSON.parse(decodedData);

            console.log('Decoded orderManagement:', orderManagement);

            // Call the service to create the OrderManagement
            const createdOrderManagement = await this.orderManagementService.addOrder(orderManagement);

            // Return a success message
            return {
                message: 'Order successfully added!',
                statusCode: 201,
                data: createdOrderManagement
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

    // @Post('findUserOrders')
    // async findAll(@Body('data') data: any) {
    //     try {

    //         const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    //         const OrderManagement: Partial<orderManagement> = JSON.parse(decodedData);

    //         const page = OrderManagement['page'] || 1;
    //         const pageSize = OrderManagement['pageSize'] || 10;
    //         let userId = OrderManagement['user'];
    //         let order_id = OrderManagement['order_id'];
    //         let order_type = OrderManagement['order_type'];
    //         const order = await this.orderManagementService.findOneById(page, pageSize, userId, order_id, order_type);

    //         return order
    //     } catch (error) {
    //         console.error('Error fetching cartManagement:', error);

    //         return {
    //             message: 'An error occurred while fetching the cartManagement',
    //             statusCode: 500,
    //             error: error.message,
    //         };
    //     }
    // }

    @Post('findUserOrders')
async findAll(@Body('data') data: any) {
  try {
    // ✅ Decode base64
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const OrderManagement: any = JSON.parse(decodedData);

    // ✅ Extract params
    const page = Number(OrderManagement.page) || 1;
    const pageSize = Number(OrderManagement.pageSize) || 10;
    const userId = OrderManagement.user || null;
    const order_id = OrderManagement.order_id || null;
    const search = OrderManagement.search || ""; // ✅ NEW
    const invoiceNo = OrderManagement.invoiceNo

    // ❌ removed order_type
    // const order_type = OrderManagement.order_type;

    // ✅ Call updated service
    const order = await this.orderManagementService.findOneById(
      page,
      pageSize,
      userId,
      order_id,
      search,
      invoiceNo
    );

    return order;

  } catch (error) {
    console.error('Error fetching orderManagement:', error);

    return {
      message: 'An error occurred while fetching the orderManagement',
      statusCode: 500,
      error: error.message,
    };
  }
}

    @Post('OrderByNow')
    async createPaymentLink(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const paymentManagement: Partial<orderManagement> = JSON.parse(decodedData);
            console.log(paymentManagement, "paymentManagement")
            return this.orderManagementService.createPaymentLink(paymentManagement);

        } catch (error) {
            console.error('Error fetching cartManagement:', error);

            return {
                message: 'An error occurred while fetching the cartManagement',
                statusCode: 500,
                error: error.message
            };
        }
    }

    @Get('paymentSuccess/:id')
    async payment(@Param('id') id: string, @Res() res: Response) {
        try {
            console.log(`Received ID: ${id}`);
            const redirectUrl = await this.orderManagementService.paymentSuccess(id);
            console.log(redirectUrl, "lkoiu")
            if (redirectUrl.statusCode == 200) {
                if (!redirectUrl || typeof redirectUrl !== 'object') {
                    throw new Error('Invalid redirect URL');
                }
                res.redirect(302, redirectUrl.paymentUrl);
            } else {
                return res.status(500).json(redirectUrl)
            }

        } catch (error) {
            console.error('Error processing payment:', error);

            return res.status(500).json({
                message: 'An error occurred while processing the payment',
                statusCode: 500,
                error: error.message
            });
        }
    }

    @Post('getShippingCharge')
    async getShippingCharge(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const address = JSON.parse(decodedData);
            console.log(`Received ID: ${address}`); // ✅ Log the received ID

            return this.orderManagementService.getShippingCharge(address);
        } catch (error) {
            console.error('Error processing payment:', error);

            return {
                message: 'An error occurred while processing the payment',
                statusCode: 500,
                error: error.message
            };
        }
    }

    @Post('getDashboardOrdereData')
    async getDashboardData() {
        try {
            // Call the service to get the dashboard data
            const result = await this.orderManagementService.getDashboardData();

            return result;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {
                message: 'An error occurred while processing the request',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('findOrderDataById')
    async findOrderData(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const OrderManagement: Partial<orderManagement> = JSON.parse(decodedData);

            let orderId = OrderManagement['order_id'];

            return this.orderManagementService.findOrderData(orderId);

        } catch (error) {
            console.error('Error fetching cartManagement:', error);
            return {
                message: 'An error occurred while fetching the cartManagement',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('buyAgain')
    async buyAgain(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const orderData: Partial<orderManagement> = JSON.parse(decodedData);
            const cartId = orderData.id
            const user = orderData.userId
            const orderItems = orderData.orderItems
            return this.orderManagementService.buyAgain(cartId, user, orderItems)

        } catch (error) {
            console.error('Error fetching cartManagement:', error);
            return {
                message: 'An error occurred while fetching the cartManagement',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('cancelOrder')
    async cancelOrder(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const orderData = JSON.parse(decodedData);
            const orderId = orderData.orderId
            return this.orderManagementService.cancelOrder(orderId)

        } catch (error) {
            console.error('Error fetching cancel order:', error);
            return {
                message: 'An error occurred while the cancel order',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('getCancelOrder')
    async getCancelOrder(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const orderData: Partial<orderManagement> = JSON.parse(decodedData);
            const userId = orderData.userId
            console.log(userId, "userId")
            return this.orderManagementService.getCancelOrder(userId)

        } catch (error) {
            console.error('Error fetching cancel order:', error);
            return {
                message: 'An error occurred while the cancel order',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('updateOrderStatus')
    async pickupOrder(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const orderData = JSON.parse(decodedData);
            const orderId = orderData.orderId
            const status = orderData.status
            return this.orderManagementService.pickupOrder(orderId,status)

        } catch (error) {
            console.error('Error fetching cancel order:', error);
            return {
                message: 'An error occurred while the cancel order',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('orderNowForPractitionerOffline')
    async orderNowForPractitioner(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const paymentManagement: Partial<orderManagement> = JSON.parse(decodedData);
            console.log(paymentManagement, "paymentManagement")
            return this.orderManagementService.orderNowForPractitionerOffline(paymentManagement);

        } catch (error) {
            console.error('Error fetching cartManagement:', error);

            return {
                message: 'An error occurred while fetching the cartManagement',
                statusCode: 500,
                error: error.message
            };
        }
    }

    @Post('practitionerOrderByNow')
    async createPractitonerPaymentLink(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const paymentManagement: Partial<orderManagement> = JSON.parse(decodedData);
            console.log(paymentManagement, "paymentManagement")
            return this.orderManagementService.createPractitonerPaymentLink(paymentManagement);

        } catch (error) {
            console.error('Error fetching practitioner cartManagement:', error);

            return {
                message: 'An error occurred while fetching the practitioner cartManagement',
                statusCode: 500,
                error: error.message
            };
        }
    }

    @Get('paymentSuccessForPractitioner/:id')
    async paymentSuccessForPractitioner(@Param('id') id: string, @Res() res: Response) {
        try {
            console.log(`Received IDs: ${id}`);
            const redirectUrl = await this.orderManagementService.paymentSuccessForPractitioner(id);
            console.log(redirectUrl, "lkoius")
            if (redirectUrl.statusCode == 200) {
                if (!redirectUrl || typeof redirectUrl !== 'object') {
                    throw new Error('Invalid redirect URL');
                }
                res.redirect(302, redirectUrl.paymentUrl);
            } else {
                return res.status(500).json(redirectUrl)
            }

        } catch (error) {
            console.error('Error processing payment:', error);

            return res.status(500).json({
                message: 'An error occurred while processing the payment',
                statusCode: 500,
                error: error.message
            });
        }
    }

    @Post('adminOrderByNow')
    async createAdminPaymentLink(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const paymentManagement: Partial<orderManagement> = JSON.parse(decodedData);
            console.log(paymentManagement, "paymentManagement")
            return this.orderManagementService.createAdminPaymentLink(paymentManagement);

        } catch (error) {
            console.error('Error fetching practitioner cartManagement:', error);

            return {
                message: 'An error occurred while fetching the practitioner cartManagement',
                statusCode: 500,
                error: error.message
            };
        }
    }

    @Get('paymentSuccessForAdmin/:id')
    async paymentSuccessForAdmin(@Param('id') id: string, @Res() res: Response) {
        try {
            console.log(`Received IDs: ${id}`);
            const redirectUrl = await this.orderManagementService.paymentSuccessForAdmin(id);
            console.log(redirectUrl, "lkoius")
            if (redirectUrl.statusCode == 200) {
                if (!redirectUrl || typeof redirectUrl !== 'object') {
                    throw new Error('Invalid redirect URL');
                }
                res.redirect(302, redirectUrl.paymentUrl);
            } else {
                return res.status(500).json(redirectUrl)
            }

        } catch (error) {
            console.error('Error processing payment:', error);

            return res.status(500).json({
                message: 'An error occurred while processing the payment',
                statusCode: 500,
                error: error.message
            });
        }
    }

    @Post('orderNowForAdminOffline')
    async orderNowForAdmin(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const paymentManagement: Partial<orderManagement> = JSON.parse(decodedData);
            console.log(paymentManagement, "paymentManagement")
            return this.orderManagementService.orderNowForAdminOffline(paymentManagement);

        } catch (error) {
            console.error('Error fetching cartManagement:', error);

            return {
                message: 'An error occurred while fetching the cartManagement',
                statusCode: 500,
                error: error.message
            };
        }
    }


    @Post('updatePickupDate')
    async updatePickupDate(@Body('data') data: any) {
        try {
            // ✅ Decode base64
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');

            // ✅ Parse JSON
            const payload: any = JSON.parse(decodedData);

            console.log(payload, "payload");

            const { orderId, newPickupDate } = payload;

            // ✅ Call service
            return await this.orderManagementService.updatePickupDateAndSendMail(
                orderId,
                newPickupDate
                            );

        } catch (error) {
            console.error('Error updating pickup date:', error);

            return {
                message: 'An error occurred while updating pickup date',
                statusCode: 500,
                error: error.message
            };
        }
    }



}

