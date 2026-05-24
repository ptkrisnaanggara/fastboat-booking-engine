import { Controller, Get, Param } from '@nestjs/common';
import { ManifestService } from './manifest.service';

@Controller('admin/schedules/:scheduleId/manifest')
export class ManifestController {
  constructor(private readonly manifestService: ManifestService) {}

  @Get()
  getScheduleManifest(@Param('scheduleId') scheduleId: string) {
    return this.manifestService.getScheduleManifest(scheduleId);
  }
}
