import { Module } from '@nestjs/common';
import { SystemClock } from '../shared/infra/clock/system-clock';
import { DependencyInjectionEnum } from '../shared/domain/dependecy-injection/dependency-injection.enum';
import { ScheduleAppointmentUseCase } from './application/schedule-appointment.use-case';
import { AppointmentController } from './infra/http/v1/controller/appointment.controller';
import { InMemoryAppointmentRepository } from './infra/persistence/repository/in-memory-appointment.repository';

@Module({
  imports: [],
  controllers: [AppointmentController],
  providers: [
    {
      provide: DependencyInjectionEnum.SCHEDULE_APPOINTMENT,
      useClass: ScheduleAppointmentUseCase,
    },
    {
      provide: DependencyInjectionEnum.APPOINTMENT_REPOSITORY,
      useClass: InMemoryAppointmentRepository,
    },
    {
      provide: DependencyInjectionEnum.CLOCK,
      useClass: SystemClock,
    },
  ],
})
export class AppointmentModule {}
