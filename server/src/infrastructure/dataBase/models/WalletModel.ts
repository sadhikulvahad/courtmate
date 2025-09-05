import { WalletProps } from "domain/types/EntityProps";
import mongoose, { Schema } from "mongoose";


const WalletSchema = new Schema<WalletProps>({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        requered: true
    },
    balance : {
        type : Number,
        default : 0
    }
})

export default mongoose.model<WalletProps>('Wallet', WalletSchema)