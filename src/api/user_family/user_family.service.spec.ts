import { Test, TestingModule } from '@nestjs/testing';
import { userFamilyService } from './user_family.service';

describe('userFamilyService', () => {
  let service: userFamilyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [userFamilyService],
    }).compile();

    service = module.get<userFamilyService>(userFamilyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
