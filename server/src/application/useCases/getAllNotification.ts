import { JwtPayload } from "jsonwebtoken";
import { NotificationRepository } from "../../domain/interfaces/NotificationRepository";
import { UserRepository } from "../../domain/interfaces/userRepository";


export class getAllNotification {
    constructor (
        private NotificationRepository : NotificationRepository
    ){}

    async execute (id: string) {
        try {
            const Notifications = await this.NotificationRepository.findByRecieverId(id)
            if(!Notifications){
                return {success: false, error: "No Notification found"}
            }

            return {success: true, message: "Notification found succesfully", Notifications: Notifications}
        } catch (error) {
            console.log("Error from Get All Admin Notification", error)
            return {success : false, error : error}
        }
    }
}