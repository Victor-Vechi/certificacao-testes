import { Inject, Injectable } from '@nestjs/common';
import type { ClockInterface } from '../../shared/domain/clock/clock.interface';
import { DependencyInjectionEnum } from '../../shared/domain/dependecy-injection/dependency-injection.enum';
import { Appointment } from '../domain/entities/appointment.entity';
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

    appointment.cancel();
    await this.repository.save(appointment);

    return appointment;
  }
}
