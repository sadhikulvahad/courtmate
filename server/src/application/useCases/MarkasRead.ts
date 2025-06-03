import { NotificationRepository } from "../../domain/interfaces/NotificationRepository";


export class MarkAsRead {
    
    constructor (
        private notificationRepository : NotificationRepository
    ){}

    async execute (id: string) {
        if(!id){
            return {success: false, error: "No id found"}
        }

        await this.notificationRepository.update(id,{
            read : true ,
        })

        return {success : true, message: "Marked As Read"}
    }
}