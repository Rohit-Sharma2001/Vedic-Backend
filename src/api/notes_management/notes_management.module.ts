// notes_management.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notes, NotesSchema } from '../../schema/schema';
import { NotesManagementService } from './notes_management.services';
import { NotesManagementController } from './notes_management.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notes.name, schema: NotesSchema }]),
  ],
  controllers: [NotesManagementController],
  providers: [NotesManagementService],
})
export class NotesManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('notes_management/add', 'notes_management/update');
  }
}
