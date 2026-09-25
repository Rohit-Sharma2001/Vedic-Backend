// enquiry_management.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CenterResources, CenterResourcesSchema } from '../../schema/schema';
import { CenterResourcesService } from './center_resources.services';
import { CenterResourcesController } from './center_resources.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CenterResources.name, schema: CenterResourcesSchema }]),
  ],
  controllers: [CenterResourcesController],
  providers: [CenterResourcesService],
})
export class CenterResourcesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('center-resources/add', 'center-resources/update');
  }
}
