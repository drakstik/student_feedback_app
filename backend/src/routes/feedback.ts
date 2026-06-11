import express, { type Request, type Response } from 'express';
import { body, validationResult } from 'express-validator';
import { requireRole } from '../middleware/rbac.js';
import { Feedback } from '../models/feedback.js';

const router = express.Router();

const validateFeedback = [
    body('comment')
        .trim()
        .notEmpty().withMessage('Comment cannot be empty.')
        .isLength({ max: 10000 }).withMessage('Comment must be under 10000 characters.'),
    (req: Request, res: Response, next: express.NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
        }
        next();
    }
];

router.post('/', requireRole(['student']), validateFeedback, async (req: Request, res: Response) => {
    try {
        const comment = req.body.comment;
        const userId = req.session.userId;

        await Feedback.create({ comment, userId });

        res.status(201).json({ message: 'Feedback submitted successfully.' });
    } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

export default router;