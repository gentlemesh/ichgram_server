import express from 'express';

import { getUsers, getUser, searchUser, followUser, unfollowUser } from '../controllers/user.js';
import { validationRules } from '../services/requestValidation.js';

const router = express.Router();

router.get('/all', validationRules.user.getAll, getUsers);
router.get('/search', validationRules.user.search, searchUser);
router.get('/', validationRules.user.getCurrent, getUser);
router.get('/:id', validationRules.user.getById, getUser);
router.post('/follow/:id', validationRules.user.followUnfollow, followUser);
router.post('/unfollow/:id', validationRules.user.followUnfollow, unfollowUser);

export default router;