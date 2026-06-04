import express from 'express';

const router = express.Router();

router.post("/", (req, res) => {
    // Check if a session exists at all
    if (!req.session || !req.session.userId) {
        return res.status(400).json({ message: "No active session found." });
    }

    const cookieName = '__Host-psid';

    // 1. Destroy the session in the Valkey data store
    req.session.destroy((err) => {
        if (err) {
            console.error("[Logout Error] Failed to destroy session in Valkey:", err);
            return res.status(500).json({ message: "Could not log out. Please try again." });
        }

        // 2. Clear the cookie from the browser
        // For __Host- cookies, path MUST be '/' and secure MUST be true
        res.clearCookie(cookieName, {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'strict'
        });

        return res.status(200).json({ message: "Successfully logged out securely." });
    });
});

export default router;