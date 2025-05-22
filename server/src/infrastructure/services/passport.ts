import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { VerifyCallback } from 'passport-oauth2';
import dotenv from "dotenv";
import { Request } from 'express';
import { UserRepositoryImplement } from '../dataBase/repositories/userRepository';
import { User } from '../../domain/entities/User';
import { GoogleAuth } from '../../application/useCases/auth/googleAuth';

dotenv.config();

const configureGoogleStrategy = () => {
    const googleAuthUseCase = new GoogleAuth(new UserRepositoryImplement());
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
        },
        async (
            req: Request,
            _accessToken: string,
            _refreshToken: string,
            profile: Profile,
            done: VerifyCallback
        ) => {
            try {
                const user = await googleAuthUseCase.execute({ id: profile?.id, displayName: profile?.displayName, emails: profile.emails || [] });
                done(null, user);
            } catch (err) {
                done(err as Error, undefined);
            }
        }
    ));
};

export { configureGoogleStrategy };
