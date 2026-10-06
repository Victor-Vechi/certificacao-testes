export class Appointment {
  constructor(
    readonly professionalId: string,
    readonly patientId: string,
    readonly startsAt: Date,
    readonly endsAt: Date,
  ) {}
}
