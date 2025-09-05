

export interface IVerifyRoom {
    execute(userId: string, roomId: string): Promise<{ isAuthorized: boolean; message: string }>
}