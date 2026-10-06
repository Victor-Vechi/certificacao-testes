import { Injectable } from '@nestjs/common';
import { ClockInterface } from '../../domain/clock/clock.interface';

@Injectable()
export class SystemClock implements ClockInterface {
  now(): Date {
    return new Date();
  }
}
