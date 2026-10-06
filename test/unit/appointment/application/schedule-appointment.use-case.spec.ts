import {
  ScheduleAppointmentInput,
  ScheduleAppointmentUseCase,
} from 'src/appointment/application/schedule-appointment.use-case';
import { ScheduleConflictException } from 'src/appointment/domain/exceptions/schedule-conflict.exception';
import { InMemoryAppointmentRepository } from 'src/appointment/infra/persistence/repository/in-memory-appointment.repository';

describe('ScheduleAppointmentUseCase', () => {
  let repository: InMemoryAppointmentRepository;
  let useCase: ScheduleAppointmentUseCase;

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
    useCase = new ScheduleAppointmentUseCase(repository);
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
});
