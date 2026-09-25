// import { Injectable, HttpService } from '@nestjs/common';
// import { AxiosResponse } from 'axios';
// import * as qs from 'qs';

// @Injectable()
// export class ZohoService {
//   private readonly clientId = 'YOUR_CLIENT_ID';
//   private readonly clientSecret = 'YOUR_CLIENT_SECRET';
//   private readonly redirectUri = 'YOUR_REDIRECT_URI';
//   private readonly zohoTokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
//   private readonly zohoApiUrl = 'https://www.zohoapis.com/crm/v2/users';

//   constructor(private readonly httpService: HttpService) {}

//   // Exchange authorization code for access token
//   async getAccessToken(authCode: string): Promise<string> {
//     const data = qs.stringify({
//       grant_type: 'authorization_code',
//       client_id: this.clientId,
//       client_secret: this.clientSecret,
//       redirect_uri: this.redirectUri,
//       code: authCode,
//     });

//     const response = await this.httpService.post(this.zohoTokenUrl, data, {
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     }).toPromise();

//     return response.data.access_token;
//   }

//   // Fetch users from Zoho CRM using access token
//   async getUserList(accessToken: string): Promise<AxiosResponse<any>> {
//     const response = await this.httpService.get(this.zohoApiUrl, {
//       headers: {
//         Authorization: `Zoho-oauthtoken ${accessToken}`,
//       },
//     }).toPromise();

//     return response.data;
//   }
// }

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // Import HttpService from @nestjs/axios
import { AxiosResponse } from 'axios';
import * as qs from 'qs';
import { lastValueFrom } from 'rxjs'; // Use this to handle Observables from HttpService

@Injectable()
export class ZohoService {
  private readonly clientId = '1000.IAZ5QVUUM9H1RE1T8Q505QD6ARBEJQ';
  private readonly clientSecret = '0a674c0619ff7345c0baa71c5f08a14c1921863f05';
  private readonly redirectUri = 'https://doyoursurvey.com';
  private readonly zohoTokenUrl = 'https://accounts.zoho.in/oauth/v2/token';
  private readonly zohoApiUrl = 'https://www.zohoapis.in/crm/v2/users';

  constructor(private readonly httpService: HttpService) {}

  // Exchange authorization code for access token
  async getAccessToken(authCode: string): Promise<string> {
    const data = qs.stringify({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code: authCode,
    });

    const response = await lastValueFrom(
      this.httpService.post(this.zohoTokenUrl, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );
console.log(response,"tokennnnnnnnnnnn")
    return response.data.access_token;
  }

  // Fetch users from Zoho CRM using access token
  async getUserList(accessToken: string): Promise<AxiosResponse<any>> {
    const response = await lastValueFrom(
      this.httpService.get(this.zohoApiUrl, {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }),
    );
    console.log(response,"resultttttttttt")
    return response.data;
  }
}
