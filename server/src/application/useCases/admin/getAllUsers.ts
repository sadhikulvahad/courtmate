

import { UserRepository } from "../../../domain/interfaces/userRepository";


export class getAllUsers{
    constructor(
        private userRepository : UserRepository
    ){}

    async execute (){
        try {
            const users = await this.userRepository.findUsers()

            if(!users){
                return {success : false, error: "No Users"}
            }
            
            return {success: true, message: "Users details got successfully", users: users}
        } catch (error) {
            console.error("Error from getAllUsers usecase", error)
            return {success : false, error: error}
        }
    }
}