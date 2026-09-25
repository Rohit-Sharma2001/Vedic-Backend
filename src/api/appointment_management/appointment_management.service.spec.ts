import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentManagementService } from './appointment_management.service';

describe('AppointmentManagementService', () => {
  let service: AppointmentManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentManagementService],
    }).compile();

    service = module.get<AppointmentManagementService>(AppointmentManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
