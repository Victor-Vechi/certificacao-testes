import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Appointment } from 'src/appointment/domain/entities/appointment.entity';
import { AppointmentNotCancellableException } from 'src/appointment/domain/exceptions/appointment-not-cancellable.exception';
import { AppointmentNotFoundException } from 'src/appointment/domain/exceptions/appointment-not-found.exception';
import { CancellationDeadlineException } from 'src/appointment/domain/exceptions/cancellation-deadline.exception';
import { MinimumNoticeException } from 'src/appointment/domain/exceptions/minimum-notice.exception';
import { OutsideBusinessHoursException } from 'src/appointment/domain/exceptions/outside-business-hours.exception';
import { PatientAppointmentLimitException } from 'src/appointment/domain/exceptions/patient-appointment-limit.exception';
import { SameDayAppointmentException } from 'src/appointment/domain/exceptions/same-day-appointment.exception';
import { ScheduleConflictException } from 'src/appointment/domain/exceptions/schedule-conflict.exception';
import { CancelAppointmentInterface } from 'src/appointment/domain/interfaces/cancel-appointment.interface';
import { ScheduleAppointmentInterface } from 'src/appointment/domain/interfaces/schedule-appointment.interface';
import { AppointmentController } from 'src/appointment/infra/http/v1/controller/appointment.controller';

describe('AppointmentController', () => {
  let scheduleAppointment: jest.Mocked<ScheduleAppointmentInterface>;
  let cancelAppointment: jest.Mocked<CancelAppointmentInterface>;
  let controller: AppointmentController;

  const body = {
    professionalId: 'prof-1',
    patientId: 'pac-1',
    startsAt: '2026-10-12T10:00:00.000Z',
    endsAt: '2026-10-12T10:30:00.000Z',
  };

  beforeEach(() => {
    scheduleAppointment = { execute: jest.fn() };
    cancelAppointment = { execute: jest.fn() };
    controller = new AppointmentController(
      scheduleAppointment,
      cancelAppointment,
    );
  });

  it('agenda a consulta convertendo as datas do payload', async () => {
    const appointment = new Appointment(
      'prof-1',
      'pac-1',
      new Date(body.startsAt),
      new Date(body.endsAt),
    );
    scheduleAppointment.execute.mockResolvedValue(appointment);

    const result = await controller.schedule(body);

    expect(scheduleAppointment.execute).toHaveBeenCalledWith({
      professionalId: 'prof-1',
      patientId: 'pac-1',
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt),
    });
    expect(result).toBe(appointment);
  });

  it('responde 409 quando há conflito de horário', async () => {
    scheduleAppointment.execute.mockRejectedValue(
      new ScheduleConflictException(),
    );

    await expect(controller.schedule(body)).rejects.toThrow(ConflictException);
  });

  it.each([
    ['antecedência mínima', new MinimumNoticeException()],
    ['horário comercial', new OutsideBusinessHoursException()],
    ['limite por paciente', new PatientAppointmentLimitException()],
    ['mesmo dia com o profissional', new SameDayAppointmentException()],
  ])('responde 422 quando viola a regra de %s', async (_, error) => {
    scheduleAppointment.execute.mockRejectedValue(error);

    await expect(controller.schedule(body)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('cancela a consulta pelo id da rota', async () => {
    const appointment = new Appointment(
      'prof-1',
      'pac-1',
      new Date(body.startsAt),
      new Date(body.endsAt),
    );
    cancelAppointment.execute.mockResolvedValue(appointment);

    await expect(controller.cancel(appointment.id)).resolves.toBe(appointment);
    expect(cancelAppointment.execute).toHaveBeenCalledWith({
      appointmentId: appointment.id,
    });
  });

  it.each([
    [
      '404',
      'consulta inexistente',
      new AppointmentNotFoundException(),
      NotFoundException,
    ],
    [
      '422',
      'fora do prazo',
      new CancellationDeadlineException(),
      UnprocessableEntityException,
    ],
    [
      '409',
      'consulta não agendada',
      new AppointmentNotCancellableException(),
      ConflictException,
    ],
  ])(
    'responde %s ao cancelar %s',
    async (_status, _case, error, httpException) => {
      cancelAppointment.execute.mockRejectedValue(error);

      await expect(controller.cancel('consulta-1')).rejects.toThrow(
        httpException,
      );
    },
  );
});
