import {
  Body,
  ConflictException,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { DependencyInjectionEnum } from '../../../../../shared/domain/dependecy-injection/dependency-injection.enum';
import { Appointment } from '../../../../domain/appointment.entity';
import { ScheduleConflictException } from '../../../../domain/exceptions/schedule-conflict.exception';
import type { ScheduleAppointmentInterface } from '../../../../domain/interfaces/schedule-appointment.interface';
import { ScheduleAppointmentDto } from '../dto/schedule-appointment.dto';

@Controller()
export class AppointmentController {
  constructor(
    @Inject(DependencyInjectionEnum.SCHEDULE_APPOINTMENT)
    private readonly scheduleAppointment: ScheduleAppointmentInterface,
  ) {}

  @Post('/appointment')
  async schedule(@Body() body: ScheduleAppointmentDto): Promise<Appointment> {
    try {
      return await this.scheduleAppointment.execute({
        professionalId: body.professionalId,
        patientId: body.patientId,
        startsAt: new Date(body.startsAt),
        endsAt: new Date(body.endsAt),
      });
    } catch (error) {
      if (error instanceof ScheduleConflictException) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }
}
