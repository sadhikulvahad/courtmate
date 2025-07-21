

import bcrypt from "bcrypt";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";


@injectable()
export class HashPassword {
  constructor(
    @inject(TYPES.Logger) private logger: Logger
  ) { }

  async hash(password: string): Promise<string> {
    try {
      this.logger.info('Hashing password');
      return await bcrypt.hash(password, 12);
    } catch (error: unknown) {
      this.logger.error('Password hashing failed', { error });
      throw error;
    }
  }

  async compare(password: string, hash: string): Promise<boolean> {
    try {
      this.logger.info('Comparing password');
      return await bcrypt.compare(password, hash);
    } catch (error: unknown) {
      this.logger.error('Password comparison failed', { error });
      throw error;
    }
  }
}