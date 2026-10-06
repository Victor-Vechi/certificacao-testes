export class ScheduleConflictException extends Error {
  constructor() {
    super('O profissional já possui uma consulta nesse horário');
    this.name = 'ScheduleConflictException';
  }
}
