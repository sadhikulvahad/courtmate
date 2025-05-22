import { UserRepository } from "../../../domain/interfaces/userRepository";
import { HashPassword } from "../../../infrastructure/services/passwordHash";


export class ResetForgotPassword{
    constructor(
        private userRepository : UserRepository,
        private hashPassword : HashPassword        
    ){}

    async execute (password :string, email:string){
        console.log(email,'email')
        const existingUser = await this.userRepository.findByEmail(email)

        if(!existingUser){
            return {success: false, error: "Invalide email id"}
        }

        if(!existingUser.isActive || !existingUser.isVerified){
            return {success: false, error: "Please signup using new Password"}
        }

        if(existingUser.isBlocked){
            return {success: false, error: "Your account has been blocked, please contact admin"}
        }

        if(existingUser.authMethod !== 'local'){
            return {success: false, error: "You signed with google, please use google auth"}
        }

        const hashedPassword = await this.hashPassword.hash(password)

        await this.userRepository.update(existingUser.id,{
            password: hashedPassword
        })

        return {success: true, message: "Password changed successfully"}
        
    }
}