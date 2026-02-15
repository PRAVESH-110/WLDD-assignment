import express from "express"
import { z } from "zod"
import cors from "cors"
import jwt from "jsonwebtoken"
import connectDatabase from "./config/database"
import userRouter from "./route/route.user"
import taskRouter from "./route/route.task"
const app = express();
app.use(express.json())


const allowedOrigins = [
    "http://localhost:3000",
    "https://checkmysite.vercel.app",
    process.env.FRONTEND_URL // Add your production frontend URL here
].filter(Boolean); // Filter out undefined values

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))

app.use("/api/auth/user", userRouter);
app.use("/api/tasks", taskRouter);


const connectServer = async () => {
    try {
        await connectDatabase();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log("listening on port", PORT);
        })
    }
    catch (err) {
        console.error("failed to connect server", err);
        process.exit(1);
    }
}
connectServer();