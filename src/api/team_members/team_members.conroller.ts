import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  UseInterceptors,
  Param,
  Get,
} from '@nestjs/common';
import { TeamMembersService } from './team_members.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { TeamMember } from 'src/schema/schema';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';

@Controller('team_members')
@UseInterceptors(Base64Interceptor)
export class TeamMembersController {
  constructor(private readonly teamService: TeamMembersService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    const parsedData: Partial<TeamMember> = JSON.parse(decodedData);
    if (files?.file?.[0]) parsedData.file = files.file[0].path;
    return await this.teamService.create(parsedData);
  }

  @Get('all')
  async getAll() {
    return await this.teamService.findAll();
  }

  @Post('view')
  async view(@Body('data') data: string) {
    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return await this.teamService.findOneById(parsed.id);
  }
  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[] },
    @Body('data') data: string
  ) {
    try {
      console.log('Request Body:', req.body); 
      console.log('Encrypted Data Received:', data);

      if (!data) {
        throw new Error('Encrypted data is missing or undefined');
      }

      let decodedData;
      try {
        decodedData = Buffer.from(data, 'base64').toString('utf-8');
        console.log('Decoded Data String:', decodedData);
      } catch (decodeError) {
        throw new Error('Failed to decode base64 data');
      }

      let teamMemberUpdates: Partial<TeamMember>;
      try {
        teamMemberUpdates = JSON.parse(decodedData);
        console.log('Parsed Team Member Updates:', teamMemberUpdates);
      } catch (parseError) {
        throw new Error('Invalid JSON in decoded data');
      }

      if (files?.file?.[0]) {
        teamMemberUpdates['file'] = files.file[0].path;
      }

      const updatedTeamMember = await this.teamService.update(id, teamMemberUpdates);

      return {
        message: 'Team member successfully updated!',
        statusCode: 200,
        data: updatedTeamMember,
      };
    } catch (error) {
      console.error('Error updating Team Member:', error.message);
      return {
        message: 'Error updating Team Member',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('delete')
  async delete(@Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decodedData);
      const id = parsed.id;

      if (!Types.ObjectId.isValid(id)) {
        return { message: 'Invalid ObjectId format', statusCode: 400 };
      }

      return await this.teamService.delete(id);
    } catch (error) {
      return {
        message: 'Error deleting entry',
        statusCode: 500,
        error: error.message,
      };
    }
  }
}

