export class Appointment {
  constructor(
    readonly professionalId: string,
    readonly patientId: string,
    readonly startsAt: Date,
    readonly endsAt: Date,
  ) {}

  overlaps(other: Appointment): boolean {
    return this.startsAt < other.endsAt && other.startsAt < this.endsAt;
  }
}
