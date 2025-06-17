import { Request, Response, NextFunction } from "express";
import { JwtTokenService } from "../services/jwt";
import { RefreshTokenUseCase } from "../../application/useCases/auth/refreshTokenUseCase";
import { UserProps } from "../../domain/types/EntityProps";
import userModel from "../dataBase/models/userModel";



export const createAuthMiddleware = (
    tokenService: JwtTokenService,
    refreshTokenUseCase: RefreshTokenUseCase
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const accessToken = req.headers.authorization?.split(' ')[1];
        try {
            // 1. Try to authenticate with access token
            if (accessToken) {
                try {
                    const decoded = tokenService.verifyToken(accessToken);
                    req.user = decoded;
                    const user = await userModel.findById(decoded.id);
                    if (!user || user.isBlocked) {
                        res.status(403).json({ message: "Account is blocked" });
                        return;
                    }
                    return next();
                } catch (error) {
                    if (error instanceof Error && error.name !== 'TokenExpiredError') {
                        throw error;

                    }
                }
            }
            const refreshToken = req.cookies?.refreshToken;
            // 2. If access token is expired/missing, try refresh token
            if (!refreshToken) {
                res.status(401).json({ error: "Authorization required" });
                return
            }
            // 3. Refresh tokens
            const result = await refreshTokenUseCase.execute(refreshToken);
            if (!result.success) {
                res.clearCookie('refreshToken');
                res.status(401).json({ error: "Session expired" });
                return
            }

            // 4. Set new tokens
            res.locals.newAccessToken = result.accessToken;
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // 5. Verify and set user from new access token
            const newDecoded = tokenService.verifyToken(result.accessToken!);
            req.user = newDecoded;

            const user = await userModel.findById(newDecoded.id);
            if (!user || user.isBlocked) {
                res.status(403).json({ message: "Account is blocked" });
                return;
            }

            next();
        } catch (error) {
            console.error("Authentication error:", error);
            res.clearCookie('refreshToken');
            res.status(401).json({
                error: "Authentication failed",
                code: error instanceof Error ? error.name : 'UNKNOWN_ERROR'
            });
            return
        }
    };
};