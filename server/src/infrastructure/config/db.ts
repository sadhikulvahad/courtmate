
import mongoose, { mongo } from "mongoose";

const connectDB = async (): Promise<void> => {
    await mongoose.connect(process.env.MONGO_URL as string)
    .then(() => console.log("Data base connected successfully ✅"))
    .catch((error) => console.error("Something wrong with Data base", error))
}

export default connectDB