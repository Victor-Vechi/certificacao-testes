import { ConflictException } from '@nestjs/common';
import { Appointment } from 'src/appointment/domain/appointment.entity';
import { ScheduleConflictException } from 'src/appointment/domain/exceptions/schedule-conflict.exception';
import { ScheduleAppointmentInterface } from 'src/appointment/domain/interfaces/schedule-appointment.interface';
import { AppointmentController } from 'src/appointment/infra/http/v1/controller/appointment.controller';

describe('AppointmentController', () => {
  let scheduleAppointment: jest.Mocked<ScheduleAppointmentInterface>;
  let controller: AppointmentController;

  const body = {
    professionalId: 'prof-1',
    patientId: 'pac-1',
    startsAt: '2026-10-12T10:00:00.000Z',
    endsAt: '2026-10-12T10:30:00.000Z',
  };

  beforeEach(() => {
    scheduleAppointment = { execute: jest.fn() };
    controller = new AppointmentController(scheduleAppointment);
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
});
