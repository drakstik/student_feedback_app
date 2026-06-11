import express from 'express';
import { requireRole } from '../middleware/rbac.js';
import { Feedback } from '../models/feedback.js';

const router = express.Router();

// Requires student role
router.get('/', requireRole(['student']), async (req, res) => {
    try {
        // Get all feedbacks from DB table
        const entries = await Feedback.findAll({
            where: { userId: req.session.userId },
            attributes: ['comment', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });

        // Return the json of just the comment & createdAt
        return res.json(entries);
    } catch (error) {
        // For dev only.
        console.error('Error getting feedback:', error);
        return res.status(500).json({ error: 'Could not retrieve feedback.' });
    }
});

export default router;