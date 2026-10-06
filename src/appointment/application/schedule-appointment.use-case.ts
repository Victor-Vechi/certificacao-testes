import { Inject, Injectable } from '@nestjs/common';
import { DependencyInjectionEnum } from '../../shared/domain/dependecy-injection/dependency-injection.enum';
import { Appointment } from '../domain/appointment.entity';
import type { AppointmentRepository } from '../domain/appointment.repository';
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
  ) {}

  async execute(input: ScheduleAppointmentInput): Promise<Appointment> {
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
