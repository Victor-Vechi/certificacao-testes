import { BusinessRuleException } from '../../../shared/domain/exceptions/business-rule.exception';

export class SameDayAppointmentException extends BusinessRuleException {
  constructor() {
    super('O paciente já possui consulta com esse profissional nesse dia');
  }
}
