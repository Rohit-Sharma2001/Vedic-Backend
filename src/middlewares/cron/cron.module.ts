// import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
// import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Product, ProductSchema, ZohoToken,ZohoTokenSchema,ZohoTokenDocument } from '../../schema/schema';
// import { CronService } from './cron.service';
// // import { ZohoController } from './zoho.controller';
// import { HttpModule } from '@nestjs/axios';
// // import{ZohoTokenM}

// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: ZohoToken.name, schema: ZohoTokenSchema }]),
//     CronService
//   ],
// //   controllers: [ZohoController],
// //   providers: [CronService,],
// })
// export class CronModule {}


import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ZohoToken, ZohoTokenSchema ,User,UserSchema,address,addressSchema,CenterManagement,CenterManagementSchema,  orderManagementSchema,
orderManagement,Master,MasterSchema,WaitlistManagement,WaitlistManagementSchema, cartManagement,cartManagementSchema} from '../../schema/schema';
import { cronService } from './cron.service';
// import { ZohoController } from './cron.controller';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: ZohoToken.name, schema: ZohoTokenSchema },
      { name: User.name, schema: UserSchema },
        { name: address.name, schema: addressSchema },
        { name: CenterManagement.name, schema: CenterManagementSchema },
        { name: orderManagement.name, schema:   orderManagementSchema },
        { name: Master.name, schema: MasterSchema },
        { name: WaitlistManagement.name, schema: WaitlistManagementSchema },
        { name: cartManagement.name, schema: cartManagementSchema },
    ]),
  ],
  providers: [cronService],
//   controllers: [ZohoController],
})
export class ZohoCronModule {}
