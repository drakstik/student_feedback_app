import express, { type Request, type Response, type NextFunction } from "express";
import { body, validationResult } from 'express-validator';
import { User } from "../models/user.js";
import argon2 from "argon2";
import { establishSession } from "../utils/noMFASession.js";

const router = express.Router();

// Input sanitization and validation
const validateLogin = [
    body('username').trim().notEmpty().toLowerCase().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: "Invalid input" });
        }
        next();
    }
];

router.post("/", validateLogin, async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const user = await User.unscoped().findOne({ where: { username } });

        // Mitigate Timing Attacks
        if (!user) {
            await argon2.verify("$argon2id$v=19$m=65536,t=3,p=1$8asdf7AT9Gf7asdf$IjY973198374082.7sdf8a9f77729zdf9", password);
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Streamline auth using the utility helper
        establishSession(
            req,
            res,
            {
                id: user.get('id') as string,
                username: user.get('username') as string,
                role: user.get('role') as "student" | "teacher"
            },
            200,
            "Login successful"
        );

    } catch (error) {
        console.error("Internal Server Error during auth:", error);
        res.status(500).json({ error: "An internal error occurred" });
    }
});

export default router;

declare module 'express-session' {
    interface SessionData {
        userId: string;
        username: string;
        isMfaVerified: boolean;
        role: 'student' | 'teacher';
    }
}