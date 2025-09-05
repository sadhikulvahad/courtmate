

export interface IDeleteCaseUsecase {
    execute(id: string): Promise<boolean>
}