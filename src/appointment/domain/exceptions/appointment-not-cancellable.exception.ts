import { BusinessConflictException } from '../../../shared/domain/exceptions/business-conflict.exception';

export class AppointmentNotCancellableException extends BusinessConflictException {
  constructor() {
    super('Apenas consultas agendadas podem ser canceladas');
  }
}
