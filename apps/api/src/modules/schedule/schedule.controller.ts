import { Controller, Get, Query } from '@nestjs/common';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  search(@Query() query: SearchScheduleDto) {
    return this.scheduleService.search(query);
  }
}
