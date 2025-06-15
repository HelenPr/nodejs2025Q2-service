import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../interfaces/tokens.interface';

@Injectable()
export class JwtStrategy {
  constructor() {}

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return { userId: payload.userId, login: payload.login };
  }
}
