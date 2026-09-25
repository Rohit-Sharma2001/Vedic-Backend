// enquiry_management.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddOns, AddOnsSchema } from '../../schema/schema';
import { AddOnsService } from './add_ons.services';
import { AddOnsController } from './add_ons.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AddOns.name, schema: AddOnsSchema }]),
  ],
  controllers: [AddOnsController],
  providers: [AddOnsService],
})
export class AddOnsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('add_ons/add', 'add_ons/update');
  }
}
