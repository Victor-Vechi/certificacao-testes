export class PatientAppointmentLimitException extends Error {
  constructor() {
    super('O paciente atingiu o limite de consultas futuras em aberto');
    this.name = 'PatientAppointmentLimitException';
  }
}
