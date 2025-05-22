import { UserRepository } from "../../../domain/interfaces/userRepository";



export class GetAllUserAdvocates{
    constructor (
        private userRepository : UserRepository
    ){}

    async execute (){
        const advocates = await this.userRepository.findAdvocates()

        if(!advocates) {
            return {success: false, error : 'No Advocates'}
        }
        return {success : true, message: 'Advocates Fetched successfully', advocates}
    }
}