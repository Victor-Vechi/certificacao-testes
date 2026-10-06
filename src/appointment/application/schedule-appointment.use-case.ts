import { Inject, Injectable } from '@nestjs/common';
import type { ClockInterface } from '../../shared/domain/clock/clock.interface';
import { DependencyInjectionEnum } from '../../shared/domain/dependecy-injection/dependency-injection.enum';
import { Appointment } from '../domain/appointment.entity';
import type { AppointmentRepository } from '../domain/appointment.repository';
import { MinimumNoticeException } from '../domain/exceptions/minimum-notice.exception';
import { OutsideBusinessHoursException } from '../domain/exceptions/outside-business-hours.exception';
import { ScheduleConflictException } from '../domain/exceptions/schedule-conflict.exception';
import { ScheduleAppointmentInput } from '../domain/interfaces/schedule-appointment-input.interface';
import { ScheduleAppointmentInterface } from '../domain/interfaces/schedule-appointment.interface';

@Injectable()
export class ScheduleAppointmentUseCase
  implements ScheduleAppointmentInterface
{
  constructor(
    @Inject(DependencyInjectionEnum.APPOINTMENT_REPOSITORY)
    private readonly repository: AppointmentRepository,
    @Inject(DependencyInjectionEnum.CLOCK)
    private readonly clock: ClockInterface,
  ) {}

  async execute(input: ScheduleAppointmentInput): Promise<Appointment> {
    const minimumStart = new Date(
      this.clock.now().getTime() + 2 * 60 * 60 * 1000,
    );

    if (input.startsAt < minimumStart) {
      throw new MinimumNoticeException();
    }

    const weekDay = input.startsAt.getDay();

    if (weekDay === 0 || weekDay === 6) {
      throw new OutsideBusinessHoursException();
    }

    const existing = await this.repository.findByProfessional(
      input.professionalId,
    );

    const appointment = new Appointment(
      input.professionalId,
      input.patientId,
      input.startsAt,
      input.endsAt,
    );

    if (existing.some((other) => other.overlaps(appointment))) {
      throw new ScheduleConflictException();
    }

    await this.repository.save(appointment);

    return appointment;
  }
}
