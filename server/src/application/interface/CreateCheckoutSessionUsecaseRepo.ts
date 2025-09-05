import { ReturnDTO } from "application/dto";



export interface ICreateCheckoutSessionUsecase {
    execute(user: { id: string, name: string, role: string, email: string } | undefined,
        advocateId: string,
        selectedSlotId: string,
        paymentMethod: "wallet" | "stripe" | "",
        bookingType: "followup" | "new" | "",
        caseId: string
    ): Promise<ReturnDTO>
}