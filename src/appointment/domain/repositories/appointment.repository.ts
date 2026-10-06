import { Appointment } from '../entities/appointment.entity';

export interface AppointmentRepository {
  findByProfessional(professionalId: string): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
}
