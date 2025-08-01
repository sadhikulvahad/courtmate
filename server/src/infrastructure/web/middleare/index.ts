// // infrastructure/web/middleware/index.ts
// import { JwtTokenService } from "../../services/jwt";
// import { UserRepositoryImplement } from "../../dataBase/repositories/UserRepository";
// import { RefreshTokenUseCase } from "../../../application/useCases/auth/RefreshTokenUseCase";
// import { createAuthMiddleware } from "../authMiddlware";

// // Initialize dependencies
// const userRepository = new UserRepositoryImplement();
// const tokenService = new JwtTokenService();
// const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository);

// // Create concrete middleware instance
// export const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase);