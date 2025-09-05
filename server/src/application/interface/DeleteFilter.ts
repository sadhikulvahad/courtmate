

export interface IDeletFilter {
    execute(id: string): Promise<void>
}