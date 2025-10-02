
export interface IUpdateUnreadCountRepo {
    execute(conversationId: string): Promise<void>
}