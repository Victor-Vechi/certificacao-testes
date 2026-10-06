import { ResourceNotFoundException } from '../../../shared/domain/exceptions/resource-not-found.exception';

export class AppointmentNotFoundException extends ResourceNotFoundException {
  constructor() {
    super('Consulta não encontrada');
  }
}
