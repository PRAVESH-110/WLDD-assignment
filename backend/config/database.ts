import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config();

async function connectDatabase() {
    try {
        // Fix TypeScript error: Ensure MONGODB_URI is defined
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }

        const connect = await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected successfully");
    }
    catch (err) {
        console.error("Failed to connect to mongoDB", err);
    }
}

export default connectDatabase;