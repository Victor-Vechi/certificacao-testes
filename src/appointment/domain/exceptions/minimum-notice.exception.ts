export class MinimumNoticeException extends Error {
  constructor() {
    super('A consulta deve ser agendada com antecedência mínima');
    this.name = 'MinimumNoticeException';
  }
}
