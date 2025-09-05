import { Types } from "mongoose";
import { TransactionProps, WalletProps } from "../../domain/types/EntityProps"


export interface IWalletRepository {
    debitAmount(walletId: string | Types.ObjectId, amount: number | string): Promise<void>
    creditAmount(WalletId: string | Types.ObjectId, amount: number | string): Promise<void>
    getWalletById(userId: string): Promise<{ wallet: WalletProps; transactions: TransactionProps[] } | null>
    createWallet(userId: string): Promise<WalletProps>;
}