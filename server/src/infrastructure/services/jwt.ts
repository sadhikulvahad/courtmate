
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'courtmateSecret'

import { TokenService } from '../../domain/interfaces/TokenRepository';

export class JwtTokenService implements TokenService {
    generateToken(id: string, role: string, name: string): string {
        return jwt.sign(
            { id, role, name },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '15m' }
        );
    }

    verifyToken(token: string): any {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    }

    generateRefreshToken(userId: string): string {
        return jwt.sign(
            { userId },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '7d' }
        );
    }

    verifyRefreshToken(token: string): any {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
    }

    generateEmailVerificationToken(email: string): string {
        return jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1m' })
    };
}