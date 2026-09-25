// src/modules/yoga_documents/yoga_documents.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YogaDocumentsController } from './yoga_documents.controller';
import { YogaDocumentsService } from './yoga_documents.service';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';
import { YogaDocument,YogaDocumentSchema } from 'src/schema/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YogaDocument.name, schema: YogaDocumentSchema },
    ]),
  ],
  controllers: [YogaDocumentsController],
  providers: [YogaDocumentsService],
})
export class YogaDocumentsModule implements NestModule {m
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('yoga_documents/add'); // apply only for upload route
  };
}
