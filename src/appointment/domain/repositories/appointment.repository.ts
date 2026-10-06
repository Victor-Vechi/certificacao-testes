import { Appointment } from '../entities/appointment.entity';

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByProfessional(professionalId: string): Promise<Appointment[]>;
  findByPatient(patientId: string): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
}
