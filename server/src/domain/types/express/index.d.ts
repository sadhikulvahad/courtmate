// src/types/express/index.d.ts or just express.d.ts

export interface JwtUserPayload {
    id: string;
    role: string;
    name?: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtUserPayload;
        }
    }
}
