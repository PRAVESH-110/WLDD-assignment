import express from "express";
import { User } from "../model/model.user"
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const userRouter = express.Router();
userRouter.use(express.json());

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "password must be at least 6 characters long"),
    fname: z.string(),
    lname: z.string(),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required")
});

userRouter.post('/signup', async function (req, res) {
    const validatedData = signupSchema.safeParse(req.body);

    if (!validatedData.success) {
        return res.status(400).json({
            message: validatedData.error.message
        })
    }

    const { email, password, fname, lname } = validatedData.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            message: "User already exist"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        email: email,
        password: hashedPassword,
        fname: fname,
        lname: lname
    })

    // TypeScript fix: Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in .env file");
    }

    const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    return res.status(201).json({
        message: "user created",
        token: token,
        user: {
            fname: newUser.fname,
            lname: newUser.lname,
            email: newUser.email
        }
    })

})

userRouter.post('/login', async function (req, res) {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: result.error.issues  // Correct Zod property
        });
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            message: "user not found"
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "invalid credentials"
        })
    }

    // TypeScript fix: Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in .env file");
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" });

    return res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
            fname: user.fname,
            lname: user.lname,
            email: user.email
        }
    })
})

export default userRouter;