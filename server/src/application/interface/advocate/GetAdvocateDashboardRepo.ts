import { AdvocateDashboardDTO } from "../../../application/dto";



export interface IGetAdvocateDashboard {
    execute(advocateId: string): Promise<AdvocateDashboardDTO>
}