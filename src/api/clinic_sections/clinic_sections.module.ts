// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicSections, ClinicSectionsSchema } from '../../schema/schema';
import { ClinicSectionsService } from './clinic_sections.service';
import { ClinicSectionsController } from './clinic_sections.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClinicSections.name, schema: ClinicSectionsSchema }]),
  ],
  controllers: [ClinicSectionsController],
  providers: [ClinicSectionsService],
})

export class ClinicSectionsModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('clinic_sections/add','clinic_sections/update/:id'); // Apply to specific route
  };
}

