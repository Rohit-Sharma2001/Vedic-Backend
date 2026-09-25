// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactAmita, ContactAmitaSchema } from '../../schema/schema';
import { ContactAmitaService } from './contact_amita.service';
import { ContactAmitaController } from './contact_amita.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContactAmita.name, schema: ContactAmitaSchema }]),
  ],
  controllers: [ContactAmitaController],
  providers: [ContactAmitaService],
})

export class ContactAmitaModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('contact_amita/add','contact_amita/update/:id'); // Apply to specific route
  };
}

