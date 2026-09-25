import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AmitaJainQuoteService } from './amitajain_quote.service';
import { AmitaJainQuoteController } from './amitajain_quote.controller';
import { AmitaJainQuoteSchema ,AmitaJainQuoteDetails } from 'src/schema/schema';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AmitaJainQuoteDetails.name, schema: AmitaJainQuoteSchema },
    ]),
  ],
  controllers: [AmitaJainQuoteController],
  providers: [AmitaJainQuoteService],
})
export class AmitaJainQuoteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
  .apply(MulterMiddleware)
  .forRoutes('amitajain_quote/add','amitajain_quote/update');

  }
}
