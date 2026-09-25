import { Module } from '@nestjs/common';
import { ServicePriceService } from './service_price.service';
import { ServicePriceController } from './service_price.controller';

@Module({
  controllers: [ServicePriceController],
  providers: [ServicePriceService],
})
export class ServicePriceModule {}
