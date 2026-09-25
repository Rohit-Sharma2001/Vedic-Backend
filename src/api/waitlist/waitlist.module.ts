import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WaitlistManagement,WaitlistManagementSchema,UserFamily, UserFamilySchema,User,UserSchema,Employee, EmployeeSchema,ServicesManagement,ServicesManagementSchema} from '../../schema/schema';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WaitlistManagement.name, schema: WaitlistManagementSchema },
      { name: User.name, schema: UserSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: ServicesManagement.name, schema: ServicesManagementSchema },
      { name: UserFamily.name, schema: UserFamilySchema },
    ]),
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule {}
