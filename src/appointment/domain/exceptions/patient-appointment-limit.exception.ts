import { BusinessRuleException } from '../../../shared/domain/exceptions/business-rule.exception';

export class PatientAppointmentLimitException extends BusinessRuleException {
  constructor() {
    super('O paciente atingiu o limite de consultas futuras em aberto');
  }
}
