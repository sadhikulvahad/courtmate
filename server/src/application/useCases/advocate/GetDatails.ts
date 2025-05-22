import { UserRepository } from "../../../domain/interfaces/userRepository";


export class GetAdvocateDetails{
    constructor(
        private userRepository : UserRepository
    ){}

    async execute (id: string){
        try {
            if(!id){
                return {success: false, error: "No Id Provided"}
            }
            const user = await this.userRepository.findById(id)
            if(!user){
                return {success : false, error: "No User with this id"}
            }
            return {success: true, message: "User detail got successfully", user: user}
        } catch (error) {
            console.error("Error from GetAdvocateDetails usecase", error)
            return {success : false, error: ""}
        }
    }
}