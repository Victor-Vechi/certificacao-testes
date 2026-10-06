import { BusinessConflictException } from '../../../shared/domain/exceptions/business-conflict.exception';

export class ScheduleConflictException extends BusinessConflictException {
  constructor() {
    super('O profissional já possui uma consulta nesse horário');
  }
}
