


import { GetNotificationsDTO } from "../../application/dto";

export interface IGetAllNotification {
    execute(id: string): Promise<GetNotificationsDTO>
}