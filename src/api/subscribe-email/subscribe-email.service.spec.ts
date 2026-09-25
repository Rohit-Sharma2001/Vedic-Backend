import { Test, TestingModule } from '@nestjs/testing';
import { SubscribeEmailService } from './subscribe-email.service';

describe('SubscribeEmailService', () => {
  let service: SubscribeEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscribeEmailService],
    }).compile();

    service = module.get<SubscribeEmailService>(SubscribeEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
