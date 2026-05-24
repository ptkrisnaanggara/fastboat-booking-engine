import { Controller, Post, Query } from '@nestjs/common';
import { BookingExpiryService } from './booking-expiry.service';

@Controller('admin/bookings/expiry')
export class BookingExpiryController {
  constructor(private readonly bookingExpiryService: BookingExpiryService) {}

  @Post('run')
  run(@Query('limit') limit?: string) {
    return this.bookingExpiryService.expireOverdueBookings(limit ? Number(limit) : 50);
  }
}
