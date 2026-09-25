// subscribe-email.module.ts

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import {
  GroupForEmail, GroupForEmailSchema,
  GroupingEmails, GroupingEmailsSchema,
  User, UserSchema,
  suscribe, suscribeSchema
} from '../../schema/schema';

import { GroupForEmailController } from './subscribe-email.controller';

import { GroupForEmailService } from './subscribe-email.service';

@Module({
  controllers: [GroupForEmailController],

  providers: [GroupForEmailService],

  imports: [
    MongooseModule.forFeature([
      {
        name: GroupForEmail.name,
        schema: GroupForEmailSchema,
      },
      {
        name: GroupingEmails.name,
        schema: GroupingEmailsSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: suscribe.name,
        schema: suscribeSchema,
      },
    ]),
  ],

  exports: [GroupForEmailService],
})

export class SubscribeEmailModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('group-for-email/uploadEmailImage','amita_project/update/:id'); // Apply to specific route
  };}