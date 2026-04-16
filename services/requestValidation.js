import { body, param, query, header } from 'express-validator';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const validateUserId = async (userId, { req: { res } }) => {
    if (!mongoose.isValidObjectId(userId)) {
        res.status(400);
        throw new Error('Invalid user id');
    }
};
const validateUserExists = async (userId, { req: { res } }) => {
    const isExists = await User.exists({ _id: userId });
    if (!isExists) {
        res.status(404);
        throw new Error('User not found');
    }
};

export const validationRules = {
    auth: {
        login: [
            body('username_email').trim()
                .notEmpty().withMessage('Field is required')
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
            ,
            body('password')
                .notEmpty().withMessage('Field is required')
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
            ,
        ],
        register: [
            body('email').trim()
                .notEmpty().withMessage('Email is required')
                .isEmail().withMessage('Email is incorrect')
                .custom(async email => {
                    const isExists = await User.exists({ email });
                    if (isExists) {
                        throw new Error('This e-mail is already in use');
                    }
                })
            ,
            body('full_name').trim()
                .notEmpty().withMessage('Full name is required')
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
            ,
            body('username').trim()
                .notEmpty().withMessage('Full name is required')
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
                .custom(async username => {
                    const isExists = await User.exists({ username });
                    if (isExists) {
                        throw new Error('This username is already taken');
                    }
                })
            ,
            body('password')
                .notEmpty().withMessage('Field is required')
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
            ,
        ],
        restore: [
            header('Referer')
                .notEmpty().withMessage('Incorrect request')
                .bail()
            ,
            body('input').trim()
                .notEmpty().withMessage('Field is required')
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
            ,
        ],
        autologin: [
            header('Referer')
                .notEmpty().withMessage('Incorrect request')
                .bail()
            ,
            param('id')
                .custom(validateUserId).bail()
                .custom(validateUserExists).bail()
            ,
        ],
    },
    user: {
        getAll: [],
        getCurrent: [],
        getById: [
            param('id')
                .custom(validateUserId).bail()
                .custom(validateUserExists).bail()
            ,
        ],
        search: [
            query('q').trim()
                .notEmpty().withMessage('Search term is required')
                .isLength({ min: 3 }).withMessage('Minimum 3 symbols required')
        ],
        followUnfollow: [
            param('id')
                .custom(validateUserId).bail()
                .custom(validateUserExists).bail()
            ,
        ],
    },
    profile: {
        getCurrent: [],
        getById: [
            param('id')
                .custom(validateUserId).bail()
                .custom(validateUserExists).bail()
            ,
        ],
        update: [
            body('username').optional().trim()
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
                .custom(async username => {
                    const isExists = await User.exists({ username });
                    if (isExists) {
                        throw new Error('This username is already taken');
                    }
                })
            ,
            body('full_name').optional().trim()
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
            ,
            body('about').optional().trim()
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
            ,
            body('website').optional().trim()
                .isURL({
                    protocols: ['http', 'https', 'ftp'],
                    require_tld: true,
                    require_protocol: true,
                }).withMessage('Incorrect website URL')
                .bail()
            ,
        ],
    },
    post: {
        getAllForCurrentUser: [],
        getAllByUserId: [
            param('userId')
                .custom(validateUserId).bail()
                .custom(validateUserExists).bail()
            ,
        ],
        getById: [
            param('id')
                .isMongoId().withMessage('Incorrect post id')
                .custom(async (id, { req: { res } }) => {
                    const isExists = await Post.exists({ _id: id });
                    if (!isExists) {
                        res.status(404);
                        throw new Error('Post not found');
                    }
                })
            ,
        ],
        create: [
            body('text').trim()
                .notEmpty().withMessage('Post text is required')
                .isLength({ max: 2200 }).withMessage('Post text is too long')
            ,
        ],
        update: [
            body('text').optional().trim()
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
                .isLength({ max: 2200 }).withMessage('Minimum 2200 symbols allowed')
                .bail()
            ,
            param('id')
                .isMongoId().withMessage('Incorrect post id')
                .custom(async (id, { req: { res } }) => {
                    const isExists = await Post.exists({ _id: id });
                    if (!isExists) {
                        res.status(404);
                        throw new Error('Post not found');
                    }
                })
            ,
        ],
        delete: [
            param('id')
                .isMongoId().withMessage('Incorrect post id')
                .custom(async (id, { req: { res } }) => {
                    const isExists = await Post.exists({ _id: id });
                    if (!isExists) {
                        res.status(404);
                        throw new Error('Post not found');
                    }
                })
            ,
        ],
        like: [
            param('id')
                .isMongoId().withMessage('Incorrect post id')
                .custom(async (id, { req: { res } }) => {
                    const isExists = await Post.exists({ _id: id });
                    if (!isExists) {
                        res.status(404);
                        throw new Error('Post not found');
                    }
                })
            ,
        ],
    },
    comment: {
        get: [
            param('postId')
                .isMongoId().withMessage('Incorrect post id')
                .custom(async (postId, { req: { res } }) => {
                    const isExists = await Post.exists({ _id: postId });
                    if (!isExists) {
                        res.status(404);
                        throw new Error('Post not found');
                    }
                })
            ,
        ],
        add: [
            body('text').trim()
                .notEmpty().withMessage('Comment text is required')
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
                .isLength({ max: 500 }).withMessage('Maximum 500 symbols allowed')
                .bail()
            ,
            param('postId')
                .isMongoId().withMessage('Incorrect post id')
                .custom(async (postId, { req: { res } }) => {
                    const isExists = await Post.exists({ _id: postId });
                    if (!isExists) {
                        res.status(404);
                        throw new Error('Post not found');
                    }
                })
            ,
        ],
        edit: [
            body('text').trim()
                .notEmpty().withMessage('Comment text is required')
                .isLength({ min: 2 }).withMessage('Minimum 2 symbols required')
                .isLength({ max: 500 }).withMessage('Maximum 500 symbols allowed')
                .bail()
            ,
            param('id')
                .isMongoId().withMessage('Incorrect comment id')
                .custom(async (id, { req: { res } }) => {
                    const isExists = await Comment.exists({ _id: id });
                    if (!isExists) {
                        res.status(404);
                        throw new Error('Comment not found');
                    }
                })
            ,
        ],
        like: [
            param('id')
                .isMongoId().withMessage('Incorrect comment id')
                .custom(async (id, { req: { res } }) => {
                    const isExists = await Comment.exists({ _id: id });
                    if (!isExists) {
                        res.status(404);
                        throw new Error('Comment not found');
                    }
                })
            ,
        ],
    }
};