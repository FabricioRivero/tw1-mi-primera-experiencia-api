import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS);
  }

  async verify(password: string, encoded: string): Promise<boolean> {
    try {
      return await compare(password, encoded);
    } catch {
      return false;
    }
  }
}
