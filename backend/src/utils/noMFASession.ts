import type { Request, Response } from "express";

interface SessionUser {
    id: string;
    username: string;
}

/**
 * Establishes an authenticated session for a user by regenerating the session,
 * mapping user data, and forcing a save to the session store.
 */
export const establishSession = (
    req: Request,
    res: Response,
    user: SessionUser,
    successStatusCode: number = 200,
    successMessage: string = "Login successful"
): void => {

    // 1. Regenerate the session to prevent session fixation
    req.session.regenerate((regenErr) => {
        if (regenErr) {
            console.error("Session Regeneration Error:", regenErr);
            // If it's a registration (201), the database entry exists, so tailor the response
            if (successStatusCode === 201) {
                res.status(201).json({
                    message: "Registration successful, but automatic login failed. Please log in manually.",
                    user: { username: user.username }
                });
                return;
            }
            res.status(500).json({ error: "Authentication failed during session generation" });
            return;
        }

        // 2. Map payload properties to the brand-new session instance
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.isMfaVerified = false; // Keep MFA logic consistent

        // 3. Force the store (Valkey) to persist data before responding
        req.session.save((saveErr) => {
            if (saveErr) {
                console.error("Session Save Error:", saveErr);
                if (successStatusCode === 201) {
                    res.status(201).json({
                        message: "Registration successful, but session could not be saved. Please log in manually.",
                        user: { username: user.username }
                    });
                    return;
                }
                res.status(500).json({ error: "Authentication failed during session storage" });
                return;
            }

            // 4. Return unified successful response structure
            res.status(successStatusCode).json({
                message: successMessage,
                user: { username: user.username }
            });
        });
    });
};