import express from 'express';
import { requireRole } from '../middleware/rbac.js';
import { Feedback } from '../models/feedback.js';

const router = express.Router();

router.get('/', requireRole(['teacher']), async (req, res) => {
    try {
        const entries = await Feedback.findAll({
            attributes: ['comment', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });
        return res.json(entries);
    } catch (error) {
        console.error('[getAllFeedback] Error:', error);
        return res.status(500).json({ error: 'Could not retrieve feedback.' });
    }
});

export default router;