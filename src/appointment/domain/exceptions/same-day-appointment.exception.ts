export class SameDayAppointmentException extends Error {
  constructor() {
    super('O paciente já possui consulta com esse profissional nesse dia');
    this.name = 'SameDayAppointmentException';
  }
}
