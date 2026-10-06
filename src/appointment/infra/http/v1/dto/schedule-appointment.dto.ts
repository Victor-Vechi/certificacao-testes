import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

export class ScheduleAppointmentDto {
  @IsString()
  @IsNotEmpty()
  professionalId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsISO8601()
  startsAt: string;

  @IsISO8601()
  endsAt: string;
}
