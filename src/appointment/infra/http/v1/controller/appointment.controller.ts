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
import { BusinessConflictException } from '../../../../../shared/domain/exceptions/business-conflict.exception';
import { BusinessRuleException } from '../../../../../shared/domain/exceptions/business-rule.exception';
import { ResourceNotFoundException } from '../../../../../shared/domain/exceptions/resource-not-found.exception';
import { DependencyInjectionEnum } from '../../../../../shared/domain/dependecy-injection/dependency-injection.enum';
import { Appointment } from '../../../../domain/entities/appointment.entity';
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
    if (error instanceof ResourceNotFoundException) {
      return new NotFoundException(error.message);
    }

    if (error instanceof BusinessConflictException) {
      return new ConflictException(error.message);
    }

    if (error instanceof BusinessRuleException) {
      return new UnprocessableEntityException(error.message);
    }

    return error as Error;
  }
}
