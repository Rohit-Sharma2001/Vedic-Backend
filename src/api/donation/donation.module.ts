// src/modules/donation/donation.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Donation, DonationSchema, User, UserSchema } from 'src/schema/schema';
import { DonationController } from './donation.controller';
import { DonationService } from './donation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Donation.name, schema: DonationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DonationController],
  providers: [DonationService],
})
export class DonationModule {}

