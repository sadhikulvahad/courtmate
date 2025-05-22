import { UserRepository } from "../../../domain/interfaces/userRepository";



export class FindUser {
    constructor(
        private userRepository : UserRepository
    ) {}

    async execute(id : string)  {
        if(!id){
            return {success : false, error: 'Id is not provided'}
        }

        const user = await this.userRepository.findById(id)

        if(!user){
            return {success: false, error: "User not found"}
        }
        console.log(user)
        return {success : true, message: 'User found', user: user}
    }
}