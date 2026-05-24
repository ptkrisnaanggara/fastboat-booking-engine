import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin/:resource')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  list(@Param('resource') resource: string) {
    return this.adminService.list(resource);
  }

  @Get(':id')
  findOne(@Param('resource') resource: string, @Param('id') id: string) {
    return this.adminService.findOne(resource, id);
  }

  @Post()
  create(@Param('resource') resource: string, @Body() body: Record<string, unknown>) {
    return this.adminService.create(resource, body);
  }

  @Patch(':id')
  update(
    @Param('resource') resource: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminService.update(resource, id, body);
  }

  @Delete(':id')
  deactivate(@Param('resource') resource: string, @Param('id') id: string) {
    return this.adminService.deactivate(resource, id);
  }
}
