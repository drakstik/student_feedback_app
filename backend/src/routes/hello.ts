import type { Request, Response } from 'express';

export const helloRoute = (req: Request, res: Response) => {
    // The requireRole middleware guarantees req.session.role exists and is valid
    const userRole = req.session.role;
    const username = req.session.username;

    if (userRole === 'teacher') {
        return res.json({
            authenticated: true,
            role: 'teacher',
            username,
            message: `🍎 [Teacher Portal active] Welcome, Professor ${username}. You have access to grade books and course management systems.`,
            featuresAllowed: ['edit_grades', 'create_assignments', 'view_metrics']
        });
    }

    if (userRole === 'student') {
        return res.json({
            authenticated: true,
            role: 'student',
            username,
            message: `🎒 [Student Dashboard active] Welcome, ${username}. You have access to view your courses, submit assignments, and look at grades.`,
            featuresAllowed: ['view_assignments', 'submit_homework']
        });
    }

    // Safety fallback
    return res.status(403).json({ error: "Role not recognized by testing interface." });
};