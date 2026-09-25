import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';

@Controller('dashboard')
@UseInterceptors(Base64Interceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('summary')
  async getDashboardSummary(@Body('data') data: string) {
    try {

        // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
      let filters: any = {};
      if (data) {
        const decodedData = Buffer.from(data, 'base64').toString('utf-8');
        filters = JSON.parse(decodedData);
      }

      const dashboardData = await this.dashboardService.getDashboardSummary(filters);

      return {
        message: 'Dashboard summary fetched successfully',
        statusCode: 200,
        data: dashboardData,
      };
    } catch (error) {
        console.log(error,"errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
      return {
        message: 'Invalid encrypted data format or server error.',
        statusCode: 400,
        error: error.message,
      };
    }
  }
}
