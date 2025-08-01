import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { TYPES } from '../../types';
import { JwtTokenService } from '../services/jwt';
import { RefreshTokenUseCase } from '../../application/useCases/auth/RefreshTokenUseCase';
import { UserRepository } from '../../domain/interfaces/UserRepository';
import { HttpStatus } from '../../domain/share/enums';
import { Logger } from 'winston';
import { JwtUserPayload } from '../../domain/types/express/index';
import { RedisService } from 'domain/interfaces/RedisService';

export interface AuthMiddleware {
    auth(req: Request, res: Response, next: NextFunction): Promise<void>;
    authorizeRoles(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
}

@injectable()
export class AuthMiddlewareImpl implements AuthMiddleware {
    constructor(
        @inject(TYPES.JwtTokenService) private tokenService: JwtTokenService,
        @inject(TYPES.RefreshTokenUseCase) private refreshTokenUseCase: RefreshTokenUseCase,
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.RedisService) private redisService: RedisService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async auth(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

            // Try to authenticate with access token
            if (accessToken) {

                const isBlacklisted = await this.redisService.isTokenBlacklisted(accessToken)
                if (isBlacklisted) {
                    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token is BlackListed' })
                    return
                }

                try {
                    const decoded = await this.tokenService.verifyToken(accessToken);
                    const user = await this.userRepository.findById(decoded.id);
                    if (!user || user.isBlocked) {
                        this.logger.warn('Account is blocked', { userId: decoded.id, path: req.path });
                        res.status(HttpStatus.FORBIDDEN).json({ error: 'Account is blocked' });
                        return;
                    }
                    req.user = decoded;
                    this.logger.info('Access token verified', { userId: decoded.id, path: req.path });
                    return next();
                } catch (error: any) {
                    if (error.name !== 'TokenExpiredError') {
                        this.logger.error('Invalid access token', { error, path: req.path });
                        throw error;
                    }
                }
            }

            // Try refresh token if access token is expired or missing
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                this.logger.warn('No tokens provided', { path: req.path });
                res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Authorization required' });
                return;
            }

            const isBlacklisted = await this.redisService.isTokenBlacklisted(refreshToken)
            if (isBlacklisted) {
                res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token is BlackListed' })
                return
            }

            // Refresh tokens
            const result = await this.refreshTokenUseCase.execute(refreshToken);
            if (!result.success || !result.accessToken || !result.refreshToken) {
                this.logger.warn('Invalid refresh token', { path: req.path });
                res.clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    path: '/',
                });
                res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Session expired' });
                return;
            }

            // Set new tokens
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });
            res.header('x-access-token', result.accessToken);

            // Verify user with new access token
            const decoded = await this.tokenService.verifyToken(result.accessToken);
            const user = await this.userRepository.findById(decoded.id);
            if (!user || user.isBlocked) {
                this.logger.warn('Account is blocked after refresh', { userId: decoded.id, path: req.path });
                res.status(HttpStatus.FORBIDDEN).json({ error: 'Account is blocked' });
                return;
            }

            req.user = decoded;
            this.logger.info('Refresh token used, new access token set', { userId: decoded.id, path: req.path });
            next();
        } catch (error: any) {
            this.logger.error('Authentication error', { error, path: req.path });
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
            });
            res.status(HttpStatus.UNAUTHORIZED).json({
                error: 'Authentication failed',
                code: error.name || 'UNKNOWN_ERROR',
            });
        }
    }

    authorizeRoles(...roles: string[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            const user = req.user as JwtUserPayload | undefined;
            const userRole = user?.role;

            if (!req.user || !userRole || !roles.includes(userRole)) {
                this.logger.warn('Access denied - insufficient role', {
                    userId: user?.id,
                    role: user?.role,
                    allowedRoles: roles,
                    path: req.path
                });

                return res.status(HttpStatus.FORBIDDEN).json({ error: 'Access Denied' });
            }
            next();
        };
    }
}