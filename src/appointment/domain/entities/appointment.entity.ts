import { randomUUID } from 'node:crypto';
import { AppointmentStatus } from '../enums/appointment-status.enum';

const HOUR_IN_MS = 60 * 60 * 1000;
const MINIMUM_NOTICE_IN_MS = 2 * HOUR_IN_MS;
const CANCELLATION_NOTICE_IN_MS = 24 * HOUR_IN_MS;
const OPENING_HOUR = 8;
const CLOSING_HOUR = 18;
const SUNDAY = 0;
const SATURDAY = 6;

export const MAX_OPEN_APPOINTMENTS_PER_PATIENT = 2;

export class Appointment {
  constructor(
    readonly professionalId: string,
    readonly patientId: string,
    readonly startsAt: Date,
    readonly endsAt: Date,
    readonly id: string = randomUUID(),
    public status: AppointmentStatus = AppointmentStatus.SCHEDULED,
  ) {}

  cancel(): void {
    this.status = AppointmentStatus.CANCELLED;
  }

  isScheduled(): boolean {
    return this.status === AppointmentStatus.SCHEDULED;
  }

  isCancellable(): boolean {
    return this.isScheduled();
  }

  isOpenAt(now: Date): boolean {
    return this.isScheduled() && this.startsAt > now;
  }

  isSameDayWithSameProfessional(other: Appointment): boolean {
    return (
      this.professionalId === other.professionalId &&
      this.startsAt.toDateString() === other.startsAt.toDateString()
    );
  }

  hasCancellationNotice(now: Date): boolean {
    return this.startsAt.getTime() - now.getTime() >= CANCELLATION_NOTICE_IN_MS;
  }

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
