// src/modules/impact_section/impact_section.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  Request,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { ImpactSectionService } from './impact_section.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ImpactSection } from 'src/schema/schema';

@Controller('impact_section')
@UseInterceptors(Base64Interceptor)
export class ImpactSectionController {
  constructor(private readonly impactService: ImpactSectionService) {}

  @Post('add')
  async create(
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[]; icon_file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {
    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const parsed: Partial<ImpactSection> = JSON.parse(decoded);
    if (files?.file?.[0]) parsed.file = files.file[0].path;
    if (files?.icon_file?.[0]) parsed.icon_file = files.icon_file[0].path;
    return await this.impactService.create(parsed);
  }

  @Post('view')
  async view(@Body('data') data: string) {
    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return await this.impactService.findOneById(parsed.id);
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Request() req: Request,
    @UploadedFiles() files: { file?: Express.Multer.File[]; icon_file?: Express.Multer.File[] },
    @Body('data') data: string,
  ) {

    const decoded = Buffer.from(data, 'base64').toString('utf-8');
    const parsed: Partial<ImpactSection> = JSON.parse(decoded);
    console.log(parsed,"parsed")
    if (files?.file?.[0]) parsed.file = files.file[0].path;
    if (files?.icon_file?.[0]) parsed.icon_file = files.icon_file[0].path;
    return await this.impactService.update(id, parsed);
  }
}
