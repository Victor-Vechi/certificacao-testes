import { Injectable } from '@nestjs/common';
import { Appointment } from '../../../domain/entities/appointment.entity';
import { AppointmentRepository } from '../../../domain/repositories/appointment.repository';

@Injectable()
export class InMemoryAppointmentRepository implements AppointmentRepository {
  private readonly appointments: Appointment[] = [];

  findById(id: string): Promise<Appointment | null> {
    return Promise.resolve(this.appointments.find((a) => a.id === id) ?? null);
  }

  findByProfessional(professionalId: string): Promise<Appointment[]> {
    return Promise.resolve(
      this.appointments.filter((a) => a.professionalId === professionalId),
    );
  }

  save(appointment: Appointment): Promise<void> {
    const index = this.appointments.findIndex((a) => a.id === appointment.id);

    if (index >= 0) {
      this.appointments[index] = appointment;
    } else {
      this.appointments.push(appointment);
    }

    return Promise.resolve();
  }
}
