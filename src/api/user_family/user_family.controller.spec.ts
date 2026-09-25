import { Test, TestingModule } from '@nestjs/testing';
import { userFamilyController } from './user_family.controller';
import { userFamilyService } from './user_family.service';

describe('userFamilyController', () => {
  let controller: userFamilyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [userFamilyController],
      providers: [userFamilyService],
    }).compile();

    controller = module.get<userFamilyController>(userFamilyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
