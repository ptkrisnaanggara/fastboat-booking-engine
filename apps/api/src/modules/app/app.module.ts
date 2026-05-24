import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module';
import { BookingModule } from '../booking/booking.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ManifestModule } from '../manifest/manifest.module';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    ScheduleModule,
    BookingModule,
    AdminModule,
    ManifestModule,
  ],
})
export class AppModule {}
