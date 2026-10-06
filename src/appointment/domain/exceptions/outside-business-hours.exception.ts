import { BusinessRuleException } from '../../../shared/domain/exceptions/business-rule.exception';

export class OutsideBusinessHoursException extends BusinessRuleException {
  constructor() {
    super('A consulta deve ser agendada dentro do horário comercial');
  }
}
