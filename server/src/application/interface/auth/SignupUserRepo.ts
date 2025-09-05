import { ReturnDTO } from "../../../application/dto";


export interface ISignupUser {
    execute(userInput: {
        name: string;
        email: string;
        phone: string;
        password: string;
        role: "user" | "admin" | "advocate";
    }): Promise<ReturnDTO>
}