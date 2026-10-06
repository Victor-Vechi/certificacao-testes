import { Appointment } from '../entities/appointment.entity';
import { CancelAppointmentInput } from './cancel-appointment-input.interface';

export interface CancelAppointmentInterface {
  execute(input: CancelAppointmentInput): Promise<Appointment>;
}
