import { TransactionProps, WalletProps } from "../../../domain/types/EntityProps";
import { IWalletRepository } from "../../../domain/interfaces/WalletRepository";
import TransactionModel from "../models/TransactionModel";
import WalletModel from "../models/WalletModel";
import { Types } from "mongoose";

export class WalletRepository implements IWalletRepository {
    async debitAmount(walletId: string | Types.ObjectId, amount: number | string): Promise<void> {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) throw new Error("Invalid amount");

        const wallet = await WalletModel.findById(walletId);
        if (!wallet) throw new Error("Wallet not found");

        if (wallet.balance < numericAmount) {
            throw new Error("Insufficient balance");
        }

        wallet.balance -= numericAmount;
        await wallet.save();

        await TransactionModel.create({
            walletId,
            amount: numericAmount,
            type: "debit",
            description: "Amount debited",
        });
    }

    async creditAmount(walletId: string | Types.ObjectId, amount: number | string): Promise<void> {
        const numericAmount = Number(amount);
        console.log(walletId, numericAmount)
        if (isNaN(numericAmount)) throw new Error("Invalid amount");

        const wallet = await WalletModel.findById(walletId);
        console.log(wallet)
        if (!wallet) throw new Error("Wallet not found");

        wallet.balance += numericAmount;
        await wallet.save();

        await TransactionModel.create({
            walletId,
            amount: numericAmount,
            type: "credit",
            description: "Amount credited",
        });
    }

    async getWalletById(userId: string): Promise<{ wallet: WalletProps; transactions: TransactionProps[] } | null> {
        const wallet = await WalletModel.findOne({ userId });
        if (!wallet) return null;

        const transactions = await TransactionModel.find({ walletId: wallet._id }).sort({ date: -1 });

        return { wallet, transactions };
    }

    async createWallet(userId: string): Promise<WalletProps> {
        const existing = await WalletModel.findOne({ userId });
        if (existing) {
            return existing;
        }

        const wallet = new WalletModel({
            userId,
            balance: 0,
        });

        await wallet.save();
        return wallet;
    }

}
