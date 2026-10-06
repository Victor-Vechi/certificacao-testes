import { BusinessRuleException } from '../../../shared/domain/exceptions/business-rule.exception';

export class CancellationDeadlineException extends BusinessRuleException {
  constructor() {
    super('A consulta só pode ser cancelada com até 24h de antecedência');
  }
}
