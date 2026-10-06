import { Appointment } from '../entities/appointment.entity';
import { ScheduleAppointmentInput } from './schedule-appointment-input.interface';

export interface ScheduleAppointmentInterface {
  execute(input: ScheduleAppointmentInput): Promise<Appointment>;
}
