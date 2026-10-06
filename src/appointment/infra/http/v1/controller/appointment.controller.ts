import {
  Body,
  ConflictException,
  Controller,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DependencyInjectionEnum } from '../../../../../shared/domain/dependecy-injection/dependency-injection.enum';
import { Appointment } from '../../../../domain/entities/appointment.entity';
import { AppointmentNotCancellableException } from '../../../../domain/exceptions/appointment-not-cancellable.exception';
import { AppointmentNotFoundException } from '../../../../domain/exceptions/appointment-not-found.exception';
import { CancellationDeadlineException } from '../../../../domain/exceptions/cancellation-deadline.exception';
import { MinimumNoticeException } from '../../../../domain/exceptions/minimum-notice.exception';
import { OutsideBusinessHoursException } from '../../../../domain/exceptions/outside-business-hours.exception';
import { PatientAppointmentLimitException } from '../../../../domain/exceptions/patient-appointment-limit.exception';
import { SameDayAppointmentException } from '../../../../domain/exceptions/same-day-appointment.exception';
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
      throw this.toHttpException(error);
    }
  }

  @Patch('/appointment/:id/cancel')
  async cancel(@Param('id') id: string): Promise<Appointment> {
    try {
      return await this.cancelAppointment.execute({ appointmentId: id });
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown): Error {
    if (error instanceof AppointmentNotFoundException) {
      return new NotFoundException(error.message);
    }

    if (
      error instanceof ScheduleConflictException ||
      error instanceof AppointmentNotCancellableException
    ) {
      return new ConflictException(error.message);
    }

    if (
      error instanceof MinimumNoticeException ||
      error instanceof OutsideBusinessHoursException ||
      error instanceof CancellationDeadlineException ||
      error instanceof PatientAppointmentLimitException ||
      error instanceof SameDayAppointmentException
    ) {
      return new UnprocessableEntityException(error.message);
    }

    return error as Error;
  }
}
