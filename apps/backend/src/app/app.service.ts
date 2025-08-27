import { Message } from '@loan-system-workspace/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): Message {
    return { message: 'Hello API' };
  }
}
