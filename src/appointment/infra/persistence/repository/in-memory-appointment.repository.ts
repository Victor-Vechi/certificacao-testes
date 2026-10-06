import { Appointment } from '../../../domain/appointment.entity';
import { AppointmentRepository } from '../../../domain/appointment.repository';

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
