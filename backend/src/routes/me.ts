import type { Request, Response } from 'express';
import express from 'express';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', requireRole(['student', 'teacher']), (req: Request, res: Response) => {
    res.json({
        username: req.session.username,
        role: req.session.role,
    });
});

export default router;