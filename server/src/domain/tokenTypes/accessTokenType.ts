

export interface accessTokenDecoded {
    email: string
    name: string
    id: string
    iat?: number
    exp?: number
}

export interface RefreshTokenPayload {
    id: string;
    iat: number;
    exp: number;
}