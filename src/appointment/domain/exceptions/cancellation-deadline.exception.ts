export class CancellationDeadlineException extends Error {
  constructor() {
    super('A consulta só pode ser cancelada com até 24h de antecedência');
    this.name = 'CancellationDeadlineException';
  }
}
