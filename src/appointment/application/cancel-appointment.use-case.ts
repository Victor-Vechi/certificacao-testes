import { Inject, Injectable } from '@nestjs/common';
import type { ClockInterface } from '../../shared/domain/clock/clock.interface';
import { DependencyInjectionEnum } from '../../shared/domain/dependecy-injection/dependency-injection.enum';
import { Appointment } from '../domain/entities/appointment.entity';
import { AppointmentStatus } from '../domain/enums/appointment-status.enum';
import { AppointmentNotCancellableException } from '../domain/exceptions/appointment-not-cancellable.exception';
import { CancellationDeadlineException } from '../domain/exceptions/cancellation-deadline.exception';
import { CancelAppointmentInput } from '../domain/interfaces/cancel-appointment-input.interface';
import { CancelAppointmentInterface } from '../domain/interfaces/cancel-appointment.interface';
import type { AppointmentRepository } from '../domain/repositories/appointment.repository';

@Injectable()
export class CancelAppointmentUseCase implements CancelAppointmentInterface {
  constructor(
    @Inject(DependencyInjectionEnum.APPOINTMENT_REPOSITORY)
    private readonly repository: AppointmentRepository,
    @Inject(DependencyInjectionEnum.CLOCK)
    private readonly clock: ClockInterface,
  ) {}

  async execute(input: CancelAppointmentInput): Promise<Appointment> {
    const appointment = (await this.repository.findById(
      input.appointmentId,
    )) as Appointment;

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new AppointmentNotCancellableException();
    }

    const hoursUntilStart =
      (appointment.startsAt.getTime() - this.clock.now().getTime()) /
      (60 * 60 * 1000);

    if (hoursUntilStart < 24) {
      throw new CancellationDeadlineException();
    }

    appointment.cancel();
    await this.repository.save(appointment);

    return appointment;
  }
}
