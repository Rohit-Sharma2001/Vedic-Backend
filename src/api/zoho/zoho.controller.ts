import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { ZohoService } from './zoho.service';

@Controller('zoho')
export class ZohoController {
  private readonly authUrl = `https://accounts.zoho.in/oauth/v2/auth?scope=ZohoCRM.users.READ&client_id=1000.IAZ5QVUUM9H1RE1T8Q505QD6ARBEJQ&response_type=code&access_type=offline&redirect_uri=https://doyoursurvey.com`;

  constructor(private readonly zohoService: ZohoService) {}

  // Endpoint to initiate OAuth login with Zoho
  @Get('auth')
  @Redirect()
  authenticate() {
    return { url: this.authUrl };
  }

  // Callback endpoint to handle authorization code and fetch user list
  @Get('users')
  async getUserList(@Query('code') authCode: string) {
    // Get access token
    const accessToken = await this.zohoService.getAccessToken(authCode);

    // Fetch user list with access token
    const users = await this.zohoService.getUserList(accessToken);

    return { users };
  }
}
