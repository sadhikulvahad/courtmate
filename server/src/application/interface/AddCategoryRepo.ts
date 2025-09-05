

export interface IAddCategory {
    execute(id: string, category: string): Promise<void>
}