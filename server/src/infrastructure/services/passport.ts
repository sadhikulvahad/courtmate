import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { GoogleAuth } from '../../application/useCases/auth/GoogleAuth';
import { Logger } from 'winston';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Request, Express } from 'express';
import { VerifyCallback } from 'passport-oauth2';

@injectable()
export class PassportService {
  constructor(
    @inject(TYPES.GoogleAuth) private googleAuth: GoogleAuth,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    this.configureGoogleStrategy();
  }

  initialize(app: Express): void {
    app.use(passport.initialize());
    this.logger.info('Passport initialized');
  }

  private configureGoogleStrategy() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
          passReqToCallback: true,
        },
        async (req: Request, _accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) => {
          try {
            this.logger.info(`Google auth for profile ${profile.id}`);
            const user = await this.googleAuth.execute({
              id: profile.id,
              displayName: profile.displayName,
              emails: profile.emails || []
            });
            done(null, user);
          } catch (error: unknown) {
            this.logger.error('Google auth failed', { error });
            done(error, undefined);
          }
        }
      )
    );
  }
}