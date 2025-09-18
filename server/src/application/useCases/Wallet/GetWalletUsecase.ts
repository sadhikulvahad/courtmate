import { IGetWallet } from "../../interface/Wallet/GetWalletRepo";
import { TransactionProps, WalletProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IWalletRepository } from "../../../domain/interfaces/WalletRepository";

@injectable()
export class GetWallet implements IGetWallet {

    constructor(
        @inject(TYPES.IWalletRepository) private _walletRepo: IWalletRepository
    ) { }

    async execute(userId: string): Promise<{ wallet: WalletProps; transactions: TransactionProps[]; } | null> {
        if (!userId) {
            throw new Error('UserId is missing')
        }

        const wallet = await this._walletRepo.getWalletById(userId)

        return wallet
    }
}