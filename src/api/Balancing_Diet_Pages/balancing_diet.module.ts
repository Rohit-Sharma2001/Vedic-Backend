// src/modules/balancing_diet/balancing_diet.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BalancingDiet ,BalancingDietSchema} from 'src/schema/schema';

import { BalancingDietController } from './balancing_diet.controller';
import { BalancingDietService } from './balancing_diet.service';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BalancingDiet.name, schema: BalancingDietSchema },
    ]),
  ],
  controllers: [BalancingDietController],
  providers: [BalancingDietService],
})
export class BalancingDietModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes(
  'balancing_diet/add',
  'balancing_diet/update/:id' // ✅ ADD this
);

  }
}
