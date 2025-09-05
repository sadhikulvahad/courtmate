

export interface IDeleteCategory {
    execute(id: string, category: string): Promise<void>
}