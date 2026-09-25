// src/modules/team_members/team_members.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamMember ,TeamMemberSchema } from 'src/schema/schema';
import { TeamMembersController } from './team_members.conroller';
import { TeamMembersService } from './team_members.service';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeamMember.name, schema: TeamMemberSchema },
    ]),
  ],
  controllers: [TeamMembersController],
  providers: [TeamMembersService],
})
export class TeamMembersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes(
        'team_members/add',
        'team_members/update/:id'
      );
  }
}
