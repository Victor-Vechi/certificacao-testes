import { Module } from '@nestjs/common';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [AppointmentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
