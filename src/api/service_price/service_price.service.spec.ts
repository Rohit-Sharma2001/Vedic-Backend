import { Test, TestingModule } from '@nestjs/testing';
import { ServicePriceService } from './service_price.service';

describe('ServicePriceService', () => {
  let service: ServicePriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicePriceService],
    }).compile();

    service = module.get<ServicePriceService>(ServicePriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
