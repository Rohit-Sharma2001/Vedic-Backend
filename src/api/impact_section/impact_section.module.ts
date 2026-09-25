// src/modules/impact_section/impact_section.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImpactSection ,ImpactSectionSchema } from 'src/schema/schema';
import { ImpactSectionController } from './impact_section.controller';
import { ImpactSectionService } from './impact_section.service';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ImpactSection.name, schema: ImpactSectionSchema },
    ]),
  ],
  controllers: [ImpactSectionController],
  providers: [ImpactSectionService],
})
export class ImpactSectionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes(
        'impact_section/add',
        'impact_section/update/:id'
      );
  }
}
