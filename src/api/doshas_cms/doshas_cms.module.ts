// src/modules/doshas_cms/doshas_cms.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoshasCmsController } from './doshas_cms.controller';
import { DoshasCmsService } from './doshas_cms.service';
import { DoshasCmsContent, DoshasCmsContentSchema } from 'src/schema/schema';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoshasCmsContent.name, schema: DoshasCmsContentSchema, collection: 'doshas_cms_content' },
    ]),
  ],
  controllers: [DoshasCmsController],
  providers: [DoshasCmsService],
})
export class DoshasCmsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MulterMiddleware).forRoutes(
      'doshas_cms/add',
      'doshas_cms/update/:id'
    );
  }
}
