import { Notification } from "../entities/Notificaiton";


export interface NotificationRepository {
    findById(id:string): Promise<Notification | null>
    findBySenderId(id:string): Promise<Notification[]>
    findByRecieverId(id: string): Promise<Notification[]>
    save(notification: Notification):Promise<Notification>
    update(id: string, updates: Partial<Notification>): Promise<Notification>
    findByRecieverIdAndUpdate(id: string, updates : Partial<Notification>) : Promise<Notification[]>
}