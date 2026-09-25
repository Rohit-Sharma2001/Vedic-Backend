import { Module } from '@nestjs/common';
import { userFamilyService } from './user_family.service';
import { userFamilyController } from './user_family.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserFamily, UserFamilySchema } from '../../schema/schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserFamily.name, schema: UserFamilySchema }
    ]),
  ],
  controllers: [userFamilyController],
  providers: [userFamilyService],
})
export class userFamilyModule { }
