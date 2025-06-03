

import { NotificationRepository } from "../../domain/interfaces/NotificationRepository";


export class MarkAllAsRead {
    
    constructor (
        private notificationRepository : NotificationRepository
    ){}

    async execute (id: string) {
        if(!id){
            return {success: false, error: "No id found"}
        }
        await this.notificationRepository.findByRecieverIdAndUpdate(id, {
            read: true
        })

        return {success : true, message: "Marked All As Read"}
    }
}