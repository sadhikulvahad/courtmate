

import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { ITokenService } from '../../domain/interfaces/TokenRepository';
import jwt from 'jsonwebtoken';
import { Logger } from 'winston';

@injectable()
export class JwtTokenService implements ITokenService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;

  constructor(
    @inject(TYPES.Logger) private logger: Logger
  ) {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
    }
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
    }

    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  }

  generateToken(id: string, role: string, name: string): string {
    this.logger.info(`Generating access token for user ${id}`);
    return jwt.sign({ id, role, name }, this.accessTokenSecret, { expiresIn: '15m' });
  }

  verifyToken(token: string): any {
    try {
      this.logger.info('Verifying access token');
      return jwt.verify(token, this.accessTokenSecret);
    } catch (error: unknown) {
      this.logger.error('Access token verification failed', { error });
      throw error;
    }
  }

  generateRefreshToken(userId: string): string {
    this.logger.info(`Generating refresh token for user ${userId}`);
    return jwt.sign({ userId }, this.refreshTokenSecret, { expiresIn: '7d' });
  }

  verifyRefreshToken(token: string): any {
    try {
      this.logger.info('Verifying refresh token');
      return jwt.verify(token, this.refreshTokenSecret);
    } catch (error: unknown) {
      this.logger.error('Refresh token verification failed', { error });
      throw error;
    }
  }

  generateEmailVerificationToken(email: string): string {
    this.logger.info(`Generating email verification token for ${email}`);
    return jwt.sign({ email }, this.accessTokenSecret, { expiresIn: '1m' });
  }
}