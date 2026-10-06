import { Module } from '@nestjs/common';
import { AppointmentModule } from './appointment/appointment.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [AppointmentModule, CalendarModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
