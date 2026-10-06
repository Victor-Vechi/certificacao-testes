import { CancelAppointmentUseCase } from 'src/appointment/application/cancel-appointment.use-case';
import { Appointment } from 'src/appointment/domain/entities/appointment.entity';
import { AppointmentNotCancellableException } from 'src/appointment/domain/exceptions/appointment-not-cancellable.exception';
import { AppointmentNotFoundException } from 'src/appointment/domain/exceptions/appointment-not-found.exception';
import { CancellationDeadlineException } from 'src/appointment/domain/exceptions/cancellation-deadline.exception';
import { AppointmentStatus } from 'src/appointment/domain/enums/appointment-status.enum';
import { InMemoryAppointmentRepository } from 'src/appointment/infra/persistence/repository/in-memory-appointment.repository';

describe('CancelAppointmentUseCase', () => {
  let repository: InMemoryAppointmentRepository;
  let useCase: CancelAppointmentUseCase;
  let now: Date;
  let appointment: Appointment;

  const clock = { now: () => now };

  beforeEach(async () => {
    repository = new InMemoryAppointmentRepository();
    useCase = new CancelAppointmentUseCase(repository, clock);

    // Segunda-feira, 12/10/2026 às 10:00
    appointment = new Appointment(
      'prof-1',
      'pac-1',
      new Date('2026-10-12T10:00:00'),
      new Date('2026-10-12T10:30:00'),
    );
    await repository.save(appointment);
  });

  it('cancela consulta com mais de 24h de antecedência', async () => {
    now = new Date('2026-10-11T09:00:00'); // 25h antes

    await useCase.execute({ appointmentId: appointment.id });

    expect(appointment.status).toBe(AppointmentStatus.CANCELLED);
  });

  it('recusa cancelamento com menos de 24h de antecedência', async () => {
    now = new Date('2026-10-11T11:00:00'); // 23h antes

    await expect(
      useCase.execute({ appointmentId: appointment.id }),
    ).rejects.toThrow(CancellationDeadlineException);
    expect(appointment.status).toBe(AppointmentStatus.SCHEDULED);
  });

  it('recusa cancelar consulta já cancelada', async () => {
    now = new Date('2026-10-11T09:00:00');
    await useCase.execute({ appointmentId: appointment.id });

    await expect(
      useCase.execute({ appointmentId: appointment.id }),
    ).rejects.toThrow(AppointmentNotCancellableException);
  });

  it('recusa cancelar consulta já realizada', async () => {
    now = new Date('2026-10-13T09:00:00'); // dia seguinte à consulta
    const completed = new Appointment(
      'prof-1',
      'pac-1',
      new Date('2026-10-12T14:00:00'),
      new Date('2026-10-12T14:30:00'),
      'consulta-realizada',
      AppointmentStatus.COMPLETED,
    );
    await repository.save(completed);

    await expect(
      useCase.execute({ appointmentId: completed.id }),
    ).rejects.toThrow(AppointmentNotCancellableException);
  });

  it('recusa cancelar consulta inexistente', async () => {
    now = new Date('2026-10-11T09:00:00');

    await expect(
      useCase.execute({ appointmentId: 'nao-existe' }),
    ).rejects.toThrow(AppointmentNotFoundException);
  });
});
