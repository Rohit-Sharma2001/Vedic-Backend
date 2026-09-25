import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentManagementController } from './appointment_management.controller';
import { AppointmentManagementService } from './appointment_management.service';

describe('AppointmentManagementController', () => {
  let controller: AppointmentManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentManagementController],
      providers: [AppointmentManagementService],
    }).compile();

    controller = module.get<AppointmentManagementController>(AppointmentManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
