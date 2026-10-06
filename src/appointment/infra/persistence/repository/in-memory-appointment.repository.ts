import { Injectable } from '@nestjs/common';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { AppointmentRepository } from '../../../domain/repositories/appointment.repository';

@Injectable()
export class InMemoryAppointmentRepository implements AppointmentRepository {
  private readonly appointments: Appointment[] = [];

  findByProfessional(professionalId: string): Promise<Appointment[]> {
    return Promise.resolve(
      this.appointments.filter((a) => a.professionalId === professionalId),
    );
  }

  save(appointment: Appointment): Promise<void> {
    this.appointments.push(appointment);
    return Promise.resolve();
  }
}
