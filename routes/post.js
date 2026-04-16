import express from 'express';

import { getPosts, getRandomPosts, getUserPosts, getPost, createPost, updatePost, deletePost, toggleLikePost } from '../controllers/post.js';
import { validationRules } from '../services/requestValidation.js';
import { uploadSingleFile } from '../middleware/uploadFiles.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/random', getRandomPosts);
router.get('/user', validationRules.post.getAllForCurrentUser, getUserPosts);
router.get('/user/:userId', validationRules.post.getAllByUserId, getUserPosts);
router.get('/one/:id', validationRules.post.getById, getPost);
router.post('/', uploadSingleFile('image'), validationRules.post.create, createPost);
router.patch('/:id', uploadSingleFile('image'), validationRules.post.update, updatePost);
router.delete('/:id', validationRules.post.delete, deletePost);
router.post('/:id/like', validationRules.post.like, toggleLikePost);

export default router;