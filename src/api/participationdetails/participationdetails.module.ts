import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipationDetails ,ParticipationDetailsSchema} from 'src/schema/schema';
import { ParticipationDetailsService } from './participationdetails.services';
import { ParticipationDetailsController } from './participationdetails.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ParticipationDetails.name, schema: ParticipationDetailsSchema },
    ]),
  ],
  controllers: [ParticipationDetailsController],
  providers: [ParticipationDetailsService],
})
export class ParticipationDetailsModule {}
