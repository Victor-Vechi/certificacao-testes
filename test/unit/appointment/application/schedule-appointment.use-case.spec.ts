import { ScheduleAppointmentUseCase } from 'src/appointment/application/schedule-appointment.use-case';
import { ScheduleConflictException } from 'src/appointment/domain/exceptions/schedule-conflict.exception';
import { InMemoryAppointmentRepository } from 'src/appointment/infra/persistence/repository/in-memory-appointment.repository';

describe('ScheduleAppointmentUseCase', () => {
  let repository: InMemoryAppointmentRepository;
  let useCase: ScheduleAppointmentUseCase;

  beforeEach(() => {
    repository = new InMemoryAppointmentRepository();
    useCase = new ScheduleAppointmentUseCase(repository);
  });

  it('agenda a consulta quando o profissional está livre', async () => {
    const appointment = await useCase.execute({
      professionalId: 'prof-1',
      patientId: 'pac-1',
      startsAt: new Date('2026-10-12T10:00:00'),
      endsAt: new Date('2026-10-12T10:30:00'),
    });

    expect(appointment.professionalId).toBe('prof-1');
    expect(await repository.findByProfessional('prof-1')).toHaveLength(1);
  });

  it('recusa consulta no mesmo horário de outra do mesmo profissional', async () => {
    await useCase.execute({
      professionalId: 'prof-1',
      patientId: 'pac-1',
      startsAt: new Date('2026-10-12T10:00:00'),
      endsAt: new Date('2026-10-12T10:30:00'),
    });

    await expect(
      useCase.execute({
        professionalId: 'prof-1',
        patientId: 'pac-2',
        startsAt: new Date('2026-10-12T10:00:00'),
        endsAt: new Date('2026-10-12T10:30:00'),
      }),
    ).rejects.toThrow(ScheduleConflictException);
  });
});
