import { User } from "../../../domain/entities/User"


export interface IGoogleAuth {
    execute(profile: {
        id: string
        displayName: string
        emails: { value: string }[]
    }): Promise<User>
}