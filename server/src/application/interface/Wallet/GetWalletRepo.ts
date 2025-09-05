import { TransactionProps, WalletProps } from "../../../domain/types/EntityProps";


export interface IGetWallet {
    execute(userId: string): Promise<{ wallet: WalletProps; transactions: TransactionProps[]; } | null>
}