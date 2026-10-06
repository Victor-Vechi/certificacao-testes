import {
  Body,
  ConflictException,
  Controller,
  Inject,
  NotImplementedException,
  Param,
  Patch,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DependencyInjectionEnum } from '../../../../../shared/domain/dependecy-injection/dependency-injection.enum';
import { Appointment } from '../../../../domain/entities/appointment.entity';
import { MinimumNoticeException } from '../../../../domain/exceptions/minimum-notice.exception';
import { OutsideBusinessHoursException } from '../../../../domain/exceptions/outside-business-hours.exception';
import { ScheduleConflictException } from '../../../../domain/exceptions/schedule-conflict.exception';
import type { CancelAppointmentInterface } from '../../../../domain/interfaces/cancel-appointment.interface';
import type { ScheduleAppointmentInterface } from '../../../../domain/interfaces/schedule-appointment.interface';
import { ScheduleAppointmentDto } from '../dto/schedule-appointment.dto';

@Controller()
export class AppointmentController {
  constructor(
    @Inject(DependencyInjectionEnum.SCHEDULE_APPOINTMENT)
    private readonly scheduleAppointment: ScheduleAppointmentInterface,
    @Inject(DependencyInjectionEnum.CANCEL_APPOINTMENT)
    private readonly cancelAppointment: CancelAppointmentInterface,
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

      if (
        error instanceof MinimumNoticeException ||
        error instanceof OutsideBusinessHoursException
      ) {
        throw new UnprocessableEntityException(error.message);
      }

      throw error;
    }
  }

  @Patch('/appointment/:id/cancel')
  cancel(@Param('id') id: string): Promise<Appointment> {
    return Promise.reject(new NotImplementedException(id));
  }
}
