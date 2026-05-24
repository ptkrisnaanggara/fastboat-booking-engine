import { Module } from '@nestjs/common';
import { BookingExpiryController } from './booking-expiry.controller';
import { BookingExpiryService } from './booking-expiry.service';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  controllers: [BookingController, BookingExpiryController],
  providers: [BookingService, BookingExpiryService],
})
export class BookingModule {}
