import express from 'express';

import { getComments, addComment, editComment, toggleLikeComment } from '../controllers/comment.js';
import { validationRules } from '../services/requestValidation.js';

const router = express.Router();

router.get('/:postId/', validationRules.comment.get, getComments);
router.post('/:postId/', validationRules.comment.add, addComment);
router.patch('/:id', validationRules.comment.edit, editComment);
router.post('/:id/like', validationRules.comment.like, toggleLikeComment);

export default router;