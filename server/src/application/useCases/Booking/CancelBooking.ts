import { ReturnDTO } from "../../../application/dto";
import { ICancelBookingRepo } from "../../../application/interface/booking/CancelBookingRepo";
import { IBookingRepository } from "../../../domain/interfaces/BookingRepository";
import { ISlotRepository } from "../../../domain/interfaces/SlotRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IWalletRepository } from "../../../domain/interfaces/WalletRepository";

@injectable()
export class CancelBooking implements ICancelBookingRepo {
    constructor(
        @inject(TYPES.IBookingRepository) private _bookingRepo: IBookingRepository,
        @inject(TYPES.ISlotRepository) private _slotRepo: ISlotRepository,
        @inject(TYPES.IWalletRepository) private _walletRepo: IWalletRepository
    ) { }

    async execute(id: string): Promise<ReturnDTO> {
        if (id.startsWith("booking-")) {
            return this.cancelBooking(id);
        } else {
            return this.cancelSlot(id);
        }
    }

    private async cancelBooking(bookingId: string): Promise<ReturnDTO> {
        const booking = await this._bookingRepo.findByBookId(bookingId);

        if (!booking) {
            return { success: false, error: "There is no booking with this Id" };
        }

        if (booking?.status === "cancelled") {
            return { success: false, error: "This booking is already cancelled" };
        }

        if (booking?.status === "postponed") {
            return { success: false, error: "You cannot cancel a postponed booking" };
        }

        const currentTime = new Date();
        const bookingTime = booking?.time ? new Date(booking.time) : null;

        if (!bookingTime) {
            return { success: false, error: "Booking has no valid time" };
        }

        const diffInMs = bookingTime.getTime() - currentTime.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours <= 3) {
            return {
                success: false,
                error: "You can only cancel a booking at least 3 hours before the scheduled time",
            };
        }

        const cancelBooking = await this._bookingRepo.updateBooking(bookingId, { status: "cancelled" });

        if (cancelBooking?.status === "cancelled") {
            const relatedSlot = await this._slotRepo.findById(cancelBooking.slotId);
            if (relatedSlot?.isAvailable === false) {
                await this._slotRepo.update(relatedSlot.id, { isAvailable: true });
            }
        }

        // refund flow
        const existingWallet = await this._walletRepo.getWalletById(booking?.userId!);
        let wallet;
        if (existingWallet) {
            wallet = existingWallet.wallet;
        } else {
            wallet = await this._walletRepo.createWallet(booking?.userId!);
        }
        await this._walletRepo.creditAmount(wallet?._id!, 100);

        return { success: true, message: "Booking cancelled and refund processed" };
    }

    private async cancelSlot(slotId: string): Promise<ReturnDTO> {
        const slot = await this._slotRepo.findById(slotId);

        if (!slot) {
            return { success: false, error: "There is no slot with this Id" };
        }

        if (slot?.status === "cancelled") {
            return { success: false, error: "This booking is already cancelled" };
        }

        if (slot?.status === "postponed") {
            return { success: false, error: "You cannot cancel a postponed booking" };
        }

        if (slot.isAvailable === false) {
            return { success: false, error: "This slot is already Disabled" };
        }

        console.log(slot)

        await this._slotRepo.update(slotId, { isAvailable: false, status: 'cancelled' });

        return { success: true, message: "Slot cancelled and made available" };
    }
}
