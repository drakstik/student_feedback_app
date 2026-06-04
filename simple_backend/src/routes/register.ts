import express, { type Request, type Response, type NextFunction } from "express";
import { body, validationResult } from 'express-validator';
import { User } from "../models/user.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { establishSession } from "../utils/noMFASession.js";

const router = express.Router();

export const ValidateFormat = [
    // 1. Sanitize & Validate Username
    body('username')
        .trim()
        .toLowerCase()
        .notEmpty().withMessage('Username is required')
        .isAlphanumeric().withMessage('Username must contain only letters and numbers')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),

    // 2. Normalize & Validate Phone Number
    body('phoneNumber')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .custom((value, { req }) => {
            const phoneNumberParsed = parsePhoneNumberFromString(value);
            if (!phoneNumberParsed || !phoneNumberParsed.isValid()) {
                throw new Error('Please enter a valid international phone number (e.g., +250789999999).');
            }
            // Sanitize input in-flight to standardized E.164 format
            req.body.phoneNumber = phoneNumberParsed.number;
            return true;
        }),

    // 3. Strict Password Validation
    body('password')
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage('Password must be at least 12 characters long and include an uppercase letter, lowercase letter, number, and symbol.'),

    // 4. Handle Express-Validator output cleanly
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Map validation errors into a clean, standardized structure
            return res.status(400).json({
                error: errors.array().map(e => e.msg).join(', ')
            });
        }
        next();
    }
];
// User registration endpoint
router.post("/", ValidateFormat, async (req: Request, res: Response) => {
    try {
        const { username, password, phoneNumber } = req.body;

        const existingUser = await User.findOne({ where: { phoneNumber } });
        if (existingUser) {
            return res.status(400).json({ error: "Registration failed. Invalid input or account already exists." });
        }

        // Create the user
        const newUser = await User.create({ username, password, phoneNumber });

        // Streamline auth using the utility helper
        establishSession(
            req,
            res,
            { id: newUser.get('id') as string, username: newUser.get('username') as string },
            201,
            "Registration and login successful"
        );

    } catch (error: any) {
        if (error && error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: "Registration failed. Invalid input or account already exists." });
        }
        console.error("Internal Registration Error: ", error);
        return res.status(500).json({ error: "An unexpected error occurred. Please try again." });
    }
});


export default router;