import { Test, TestingModule } from '@nestjs/testing';
import { SubscribeEmailController } from './subscribe-email.controller';

describe('SubscribeEmailController', () => {
  let controller: SubscribeEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscribeEmailController],
    }).compile();

    controller = module.get<SubscribeEmailController>(SubscribeEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
