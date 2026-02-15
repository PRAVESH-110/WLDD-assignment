import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Extend Express Request type to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized - No token provided"
        });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in .env file");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
        req.userId = decoded.id; // Attach user ID to request
        next(); // Continue to next middleware/route
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized - Invalid token"
        });
    }
}

export default authMiddleware;