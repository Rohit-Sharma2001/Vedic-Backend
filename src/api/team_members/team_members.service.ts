// src/modules/team_members/team_members.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TeamMember,TeamMemberDocument } from 'src/schema/schema';
@Injectable()
export class TeamMembersService {
  constructor(
    @InjectModel(TeamMember.name)
    private teamModel: Model<TeamMemberDocument>,
  ) {}

  async create(data: Partial<TeamMember>): Promise<TeamMember> {
    const entry = new this.teamModel(data);
    return entry.save();
  }

  async findAll(): Promise<any> {
    const entries = await this.teamModel.find().exec();
    const hostUrl = 'http://localhost:3008';
    return entries.map(entry => {
      const obj: any = entry.toObject();
      obj.imageUrl = obj.file ? `${hostUrl}/${obj.file.replace(/\\/g, '/')}` : null;
      return obj;
    });
  }

  async findOneById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId', statusCode: 400 };
    }
    const entry = await this.teamModel.findById(id).exec();
    if (!entry) {
      return { message: 'Entry not found', statusCode: 404 };
    }
    const result: any = entry.toObject();
    const hostUrl = 'http://localhost:3008';
    result.imageUrl = result.file ? `${hostUrl}/${result.file.replace(/\\/g, '/')}` : null;
    return result;
  }

  async update(id: string, data: Partial<TeamMember>): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId', statusCode: 400 };
    }
    const entry = await this.teamModel.findById(id);
    if (!entry) {
      return { message: 'Entry not found', statusCode: 404 };
    }
    for (const key in data) {
      if (data[key] !== undefined) {
        entry[key] = data[key];
      }
    }
    const saved = await entry.save();
    const result: any = saved.toObject();
    const hostUrl = 'http://localhost:3008';
    result.imageUrl = result.file ? `${hostUrl}/${result.file.replace(/\\/g, '/')}` : null;
    return result;
  }

  async delete(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ObjectId', statusCode: 400 };
    }
    const deleted = await this.teamModel.findByIdAndDelete(id);
    if (!deleted) {
      return { message: 'Entry not found', statusCode: 404 };
    }
    return { message: 'Entry deleted successfully', statusCode: 200 };
  }
}