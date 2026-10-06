import { ScheduleAppointmentUseCase } from 'src/appointment/application/schedule-appointment.use-case';
import { OutsideBusinessHoursException } from 'src/appointment/domain/exceptions/outside-business-hours.exception';
import { MinimumNoticeException } from 'src/appointment/domain/exceptions/minimum-notice.exception';
import { ScheduleConflictException } from 'src/appointment/domain/exceptions/schedule-conflict.exception';
import { ScheduleAppointmentInput } from 'src/appointment/domain/interfaces/schedule-appointment-input.interface';
import { InMemoryAppointmentRepository } from 'src/appointment/infra/persistence/repository/in-memory-appointment.repository';

describe('ScheduleAppointmentUseCase', () => {
  let repository: InMemoryAppointmentRepository;
  let useCase: ScheduleAppointmentUseCase;

  // Sexta-feira, 09/10/2026 às 09:00
  const clock = { now: () => new Date('2026-10-09T09:00:00') };

  const input = (
    overrides: Partial<ScheduleAppointmentInput> = {},
  ): ScheduleAppointmentInput => ({
    professionalId: 'prof-1',
    patientId: 'pac-1',
    startsAt: new Date('2026-10-12T10:00:00'),
    endsAt: new Date('2026-10-12T10:30:00'),
    ...overrides,
  });

  beforeEach(() => {
    repository = new InMemoryAppointmentRepository();
    useCase = new ScheduleAppointmentUseCase(repository, clock);
  });

  it('agenda a consulta quando o profissional está livre', async () => {
    const appointment = await useCase.execute(input());

    expect(appointment.professionalId).toBe('prof-1');
    expect(await repository.findByProfessional('prof-1')).toHaveLength(1);
  });

  it('recusa consulta no mesmo horário de outra do mesmo profissional', async () => {
    await useCase.execute(input());

    await expect(
      useCase.execute(input({ patientId: 'pac-2' })),
    ).rejects.toThrow(ScheduleConflictException);
  });

  it('recusa consulta que sobrepõe parcialmente outra do mesmo profissional', async () => {
    await useCase.execute(input());

    await expect(
      useCase.execute(
        input({
          patientId: 'pac-2',
          startsAt: new Date('2026-10-12T10:15:00'),
          endsAt: new Date('2026-10-12T10:45:00'),
        }),
      ),
    ).rejects.toThrow(ScheduleConflictException);
  });

  it('permite consulta que começa exatamente quando a anterior termina', async () => {
    await useCase.execute(input());

    await expect(
      useCase.execute(
        input({
          patientId: 'pac-2',
          startsAt: new Date('2026-10-12T10:30:00'),
          endsAt: new Date('2026-10-12T11:00:00'),
        }),
      ),
    ).resolves.toBeDefined();
  });

  it('permite o mesmo horário para profissionais diferentes', async () => {
    await useCase.execute(input());

    await expect(
      useCase.execute(input({ professionalId: 'prof-2', patientId: 'pac-2' })),
    ).resolves.toBeDefined();
  });

  it('recusa consulta no passado', async () => {
    await expect(
      useCase.execute(
        input({
          startsAt: new Date('2026-10-08T10:00:00'),
          endsAt: new Date('2026-10-08T10:30:00'),
        }),
      ),
    ).rejects.toThrow(MinimumNoticeException);
  });

  it('recusa consulta com menos de 2h de antecedência', async () => {
    await expect(
      useCase.execute(
        input({
          startsAt: new Date('2026-10-09T10:30:00'),
          endsAt: new Date('2026-10-09T11:00:00'),
        }),
      ),
    ).rejects.toThrow(MinimumNoticeException);
  });

  it('recusa consulta no fim de semana', async () => {
    await expect(
      useCase.execute(
        input({
          startsAt: new Date('2026-10-10T10:00:00'),
          endsAt: new Date('2026-10-10T10:30:00'),
        }),
      ),
    ).rejects.toThrow(OutsideBusinessHoursException);
  });

  it('recusa consulta que termina depois das 18h', async () => {
    await expect(
      useCase.execute(
        input({
          startsAt: new Date('2026-10-12T17:45:00'),
          endsAt: new Date('2026-10-12T18:15:00'),
        }),
      ),
    ).rejects.toThrow(OutsideBusinessHoursException);
  });

  it('recusa consulta que começa antes das 8h', async () => {
    await expect(
      useCase.execute(
        input({
          startsAt: new Date('2026-10-12T07:30:00'),
          endsAt: new Date('2026-10-12T08:00:00'),
        }),
      ),
    ).rejects.toThrow(OutsideBusinessHoursException);
  });

  it.each([
    [
      'às 08:00, na abertura do expediente',
      '2026-10-12T08:00:00',
      '2026-10-12T08:30:00',
    ],
    [
      'terminando às 18:00, no fechamento',
      '2026-10-12T17:30:00',
      '2026-10-12T18:00:00',
    ],
    [
      'com exatamente 2h de antecedência',
      '2026-10-09T11:00:00',
      '2026-10-09T11:30:00',
    ],
  ])('permite consulta %s', async (_, startsAt, endsAt) => {
    await expect(
      useCase.execute(
        input({ startsAt: new Date(startsAt), endsAt: new Date(endsAt) }),
      ),
    ).resolves.toBeDefined();
  });
});
