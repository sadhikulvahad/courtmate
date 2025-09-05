

export interface IAddFilter{
    execute(name : string, type: string) : Promise<void>
}