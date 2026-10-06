import { Appointment } from '../domain/appointment.entity';
import { AppointmentRepository } from '../domain/appointment.repository';
import { ScheduleConflictException } from '../domain/exceptions/schedule-conflict.exception';

export interface ScheduleAppointmentInput {
  professionalId: string;
  patientId: string;
  startsAt: Date;
  endsAt: Date;
}

export class ScheduleAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

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
