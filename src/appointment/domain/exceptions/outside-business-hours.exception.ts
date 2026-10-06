export class OutsideBusinessHoursException extends Error {
  constructor() {
    super('A consulta deve ser agendada dentro do horário comercial');
    this.name = 'OutsideBusinessHoursException';
  }
}
