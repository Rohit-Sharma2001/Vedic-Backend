import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../../schema/schema';
import { ZohoService } from './zoho.service';
import { ZohoController } from './zoho.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),HttpModule,
  ],
  controllers: [ZohoController],
  providers: [ZohoService],
})
export class ZohoModule {}