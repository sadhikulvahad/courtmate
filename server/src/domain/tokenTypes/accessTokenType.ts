

export interface accessTokenDecoded {
    email: string
    name: string
    userId: string
    iat?: number
    exp?: number
}

export interface RefreshTokenPayload {
    userId: string;
    iat: number;
    exp: number;
}