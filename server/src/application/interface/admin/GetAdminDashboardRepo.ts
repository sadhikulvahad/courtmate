import { AdminDashboardDTO } from "../../../application/dto";


export interface IGetAdminDashboardRepo {
    execute() : Promise<AdminDashboardDTO>
}