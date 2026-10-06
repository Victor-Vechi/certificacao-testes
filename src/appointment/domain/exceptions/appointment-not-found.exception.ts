export class AppointmentNotFoundException extends Error {
  constructor() {
    super('Consulta não encontrada');
    this.name = 'AppointmentNotFoundException';
  }
}
