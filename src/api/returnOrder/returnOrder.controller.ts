import { Controller, Get, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query, Res } from '@nestjs/common';
import { returnOrderService } from './returnOrder.service';
import { returnOrder, orderManagement } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express, Response } from 'express';
// import {  } from 'express';
@Controller('returnOrder')
@UseInterceptors(Base64Interceptor)
export class returnOrderController {
    constructor(private readonly returnOrderService: returnOrderService) { }

    @Post('applyforReturn')
    async applyforReturn(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const returnOrderData = JSON.parse(decodedData);

            // let orderId = OrderManagement['order_id'];
            console.log(returnOrderData,"returnOrderData")
            return this.returnOrderService.applyforReturn(returnOrderData);

        } catch (error) {
            console.error('Error fetching returnOrder place:', error);
            return {
                message: 'An error occurred while fetching the returnOrder',
                statusCode: 500,
                error: error.message,
            };
        }
    }


    @Post('getReturnOrderAtAdmin')
    async getReturnOrderAtAdmin(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const returnOrderData= JSON.parse(decodedData);
            return this.returnOrderService.getReturnOrderAtAdmin(returnOrderData.id);

        } catch (error) {
            console.error('Error fetching returnOrder place:', error);
            return {
                message: 'An error occurred while fetching the returnOrder',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('getUserReturnOrder')
    async getUserReturnOrder(@Body('data') data: any) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const orderData: Partial<returnOrder> = JSON.parse(decodedData);
            return this.returnOrderService.getUserReturnOrder(orderData);

        } catch (error) {
            console.error('Error fetching returnManagement:', error);
            return {
                message: 'An error occurred while fetching the cartManagement',
                statusCode: 500,
                error: error.message,
            };
        }
    }

    @Post('applyForReturnByAdmin')
    async getpaymentid(@Body('data') data: any) {
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        const orderData: Partial<returnOrder> = JSON.parse(decodedData);
        return this.returnOrderService.applyForReturnByAdmin(orderData);

    } catch(error) {
        console.error('Error fetching cartManagement:', error);
        return {
            message: 'An error occurred while fetching the cartManagement',
            statusCode: 500,
            error: error.message,
        };
    }

     @Post('findAllOrders')
        async findAll(@Body('data') data: any) {
            try {
    
                const decodedData = Buffer.from(data, 'base64').toString('utf-8');
                const OrderManagement = JSON.parse(decodedData);
    
                const page = OrderManagement['page'] || 1;
                const pageSize = OrderManagement['pageSize'] || 10;
                let userId = OrderManagement['user'];
                let orderId = OrderManagement['order_id'];
    
                const order = await this.returnOrderService.findOneById(page, pageSize, userId, orderId);
    
                return order
            } catch (error) {
                console.error('Error fetching cartManagement:', error);
    
                return {
                    message: 'An error occurred while fetching the cartManagement',
                    statusCode: 500,
                    error: error.message,
                };
            }
        }

        

}