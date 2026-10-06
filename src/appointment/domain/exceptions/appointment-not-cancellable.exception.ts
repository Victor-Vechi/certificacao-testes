export class AppointmentNotCancellableException extends Error {
  constructor() {
    super('Apenas consultas agendadas podem ser canceladas');
    this.name = 'AppointmentNotCancellableException';
  }
}
