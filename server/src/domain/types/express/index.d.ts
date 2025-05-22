// src/types/express/index.d.ts or just express.d.ts

// declare global {
//     namespace Express {
//         interface Request {
//             user?: { id: string };
//         }
//     }
// }// src/types/express/index.d.ts

export interface JwtUserPayload {
    _id: string;
    role?: string;
    name?: string;
    iat?: number;
    exp?: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtUserPayload;
        }
    }
}
