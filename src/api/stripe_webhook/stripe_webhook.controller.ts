import { Controller, Get,Req, Post, Body, UploadedFile, UploadedFiles, Request, Put, Param, UseInterceptors, Query, Res } from '@nestjs/common';
import { StripeWebhookService } from './stripe_webhook.service';
import { orderManagement } from '../../schema/schema';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';
import { Express, Response } from 'express';
import { userInfo } from 'os';
// import {  } from 'express';
@Controller('stripe_webhook')
// @UseInterceptors(Base64Interceptor)
export class StripeWebhookController {
    constructor(private readonly stripeWebhookService: StripeWebhookService) { }

    // @Post('webhook')
    //   async webhook ( @Req() req: Request, @Res() res: Response) {
    // const result=  await this.stripeWebhookService.webhook(req);
    // console.log(result,'result')
    // return result
    // };
    @Post('webhook')
async webhook(@Req() req: Request, @Res() res: Response) {
    const result = await this.stripeWebhookService.webhook(req);
    return res.status(200).json(result);
}
}