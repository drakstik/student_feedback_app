import type { Request, Response } from 'express';

export const helloRoute = (req: Request, res: Response) => {
    if (req.session && req.session.userId) {
        return res.json({
            authenticated: true,
            message: `Hello ${req.session.username}! You are logged in!`
        });
    }

    return res.json({
        authenticated: false,
        message: "Hello Guest! Please log in."
    });
};