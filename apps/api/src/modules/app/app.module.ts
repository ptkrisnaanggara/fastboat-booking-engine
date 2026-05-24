import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from '../booking/booking.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    ScheduleModule,
    BookingModule,
  ],
})
export class AppModule {}
