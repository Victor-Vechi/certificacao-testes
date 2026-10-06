const MINIMUM_NOTICE_IN_MS = 2 * 60 * 60 * 1000;
const OPENING_HOUR = 8;
const CLOSING_HOUR = 18;
const SUNDAY = 0;
const SATURDAY = 6;

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

  hasMinimumNotice(now: Date): boolean {
    return this.startsAt.getTime() - now.getTime() >= MINIMUM_NOTICE_IN_MS;
  }

  isWithinBusinessHours(): boolean {
    const weekDay = this.startsAt.getDay();

    if (weekDay === SUNDAY || weekDay === SATURDAY) {
      return false;
    }

    const openingTime = new Date(this.startsAt);
    openingTime.setHours(OPENING_HOUR, 0, 0, 0);

    const closingTime = new Date(this.startsAt);
    closingTime.setHours(CLOSING_HOUR, 0, 0, 0);

    return this.startsAt >= openingTime && this.endsAt <= closingTime;
  }
}
