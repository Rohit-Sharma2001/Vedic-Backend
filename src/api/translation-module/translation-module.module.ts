import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { translationManagement, translationsSchema } from 'src/schema/schema';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';


@Module({
    imports: [
      MongooseModule.forFeature([{ name: translationManagement.name, schema: translationsSchema },
          { name: translationManagement.name, schema: translationsSchema }
      ]),
    ],
    controllers: [TranslationController],
    providers: [TranslationService],
  })

  
export class TranslationModuleModule {}
