// src/modules/ayurvedic_healing/ayurvedic_healing.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AyurVedicNaturalHealing ,AyurVedicNaturalHealingSchema} from 'src/schema/schema';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';
import { AyurVedicHealingController } from './ayurvedic_natutal_healing.controller';
import { AyurVedicNaturalHealingService } from './ayurvedic_natutal_healing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AyurVedicNaturalHealing.name, schema: AyurVedicNaturalHealingSchema },
    ]),
  ],
  controllers: [AyurVedicHealingController],
  providers: [AyurVedicNaturalHealingService],
})
export class AyurVedicHealingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes(
        'ayurvedic_healing/add',
        'ayurvedic_healing/update/:id'
      );
      
  }
}
