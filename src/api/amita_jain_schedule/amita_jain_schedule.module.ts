// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AmitaJainSchedule, AmitaJainScheduleSchema } from '../../schema/schema';
import { AmitaJainScheduleService } from './amita_jain_schedule.service';
import { AmitaJainScheduleController } from './amita_jain_schedule.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AmitaJainSchedule.name, schema: AmitaJainScheduleSchema }]),
  ],
  controllers: [AmitaJainScheduleController],
  providers: [AmitaJainScheduleService],
})

export class AmitaJainScheduleModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('amita_jain_schedule/add','amita_jain_schedule/update/:id'); // Apply to specific route
  };
}

