import { BusinessRuleException } from '../../../shared/domain/exceptions/business-rule.exception';

export class MinimumNoticeException extends BusinessRuleException {
  constructor() {
    super('A consulta deve ser agendada com antecedência mínima');
  }
}
