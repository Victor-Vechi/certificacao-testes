import { Appointment } from '../domain/appointment.entity';
import { AppointmentRepository } from '../domain/appointment.repository';

export interface ScheduleAppointmentInput {
  professionalId: string;
  patientId: string;
  startsAt: Date;
  endsAt: Date;
}

export class ScheduleAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(input: ScheduleAppointmentInput): Promise<Appointment> {
    const appointment = new Appointment(
      input.professionalId,
      input.patientId,
      input.startsAt,
      input.endsAt,
    );

    await this.repository.save(appointment);

    return appointment;
  }
}
