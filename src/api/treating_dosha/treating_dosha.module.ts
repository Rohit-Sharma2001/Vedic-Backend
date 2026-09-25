// src/modules/treating_dosha/treating_dosha.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TreatingDoshaController } from './treating_dosha.controller';
import { TreatingDoshaService } from './treating_dosha.service';
import { TreatingDoshaImbalance, TreatingDoshaImbalanceSchema } from 'src/schema/schema';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TreatingDoshaImbalance.name, schema: TreatingDoshaImbalanceSchema, collection: 'treating_dosha_imbalance' },
    ]),
  ],
  controllers: [TreatingDoshaController],
  providers: [TreatingDoshaService],
})
export class TreatingDoshaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MulterMiddleware).forRoutes(
      'treating_dosha/add',
      'treating_dosha/update/:id'
    );
  }
}
