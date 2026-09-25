import {
  Controller,
  Post,
  Body,
  Param,
  Put,
} from '@nestjs/common';
import { ParticipationDetails } from 'src/schema/schema';
import { ParticipationDetailsService } from './participationdetails.services';
import { Types } from 'mongoose';

@Controller('participationdetails')
export class ParticipationDetailsController {
  constructor(
    private readonly participationService: ParticipationDetailsService,
  ) {}

  private encodeResponse(response: any) {
    const jsonString = JSON.stringify(response);
    return Buffer.from(jsonString).toString('base64');
  }

  @Post('add')
  async create(@Body('data') data: string) {
    try {
      if (!data) throw new Error('Encrypted data is missing');

      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const details: Partial<ParticipationDetails> = JSON.parse(decodedData);

      const created = await this.participationService.create(details);

      const response = {
        message: 'Participation details added successfully!',
        statusCode: 201,
        data: created,
      };

      return this.encodeResponse(response); // ✅ Base64 encode response
    } catch (error) {
      return this.encodeResponse({
        message: 'Error adding participation details',
        statusCode: 400,
        error: error.message,
      });
    }
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body('data') data: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return this.encodeResponse({
          message: 'Invalid ObjectId',
          statusCode: 400,
        });
      }

      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const updates = JSON.parse(decoded);

      const updated = await this.participationService.update(id, updates);

      const response = {
        message: 'Participation details updated successfully!',
        statusCode: 200,
        data: updated,
      };

      return this.encodeResponse(response); // ✅ Base64 encode response
    } catch (error) {
      return this.encodeResponse({
        message: 'Error updating participation details',
        statusCode: 400,
        error: error.message,
      });
    }
  }

  @Post('all')
  async findAll(@Body('data') data: string) {
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const payload = JSON.parse(decoded);

      const page = payload.page || 1;
      const pageSize = payload.pageSize || 10;

      const result = await this.participationService.findAll(page, pageSize);

      const response = {
        message: 'Participation details fetched successfully!',
        statusCode: 200,
        ...result,
      };

      return this.encodeResponse(response); // ✅ Base64 encode response
    } catch (error) {
      return this.encodeResponse({
        message: 'Error fetching participation details',
        statusCode: 400,
        error: error.message,
      });
    }
  }
}
