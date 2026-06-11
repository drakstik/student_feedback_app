import type { Request, Response, NextFunction } from "express";

/**
 * Enforces authenticated session access and restricts resource execution 
 * to specifically authorized roles.
 * @param allowedRoles Array of strings defining allowed access profiles
 */
export function requireRole(allowedRoles: Array<'student' | 'teacher'>) {
    return (req: Request, res: Response, next: NextFunction) => {
        // 1. Check if session exists and user is authenticated
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: "Unauthorized. Please log in first." });
        }

        // 2. Extract and match assigned role
        const userRole = req.session.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: "Forbidden. You do not have permission to perform this action."
            });
        }

        // Access authorized, proceed to the endpoint handler
        next();
    };
}