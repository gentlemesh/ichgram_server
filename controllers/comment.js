import { validationResult, matchedData } from 'express-validator';

import Comment from '../models/Comment.js';
import LikeComment from '../models/LikeComment.js';

export const getComments = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const comments = await Comment
            .find({ post: req.params.postId })
            .populate('author', ['_id', 'username', 'picture'])
            .populate('likesCount')
            .exec()
            ;
        for (const comment of comments) {
            comment.isLiked = !!(await LikeComment.exists({ comment: comment._id, liker: req.user.id }));
        }

        return res.json({ data: { comments } });
    } catch (err) {
        console.error('Error on get post comments: ', err.stack);
        res.sendError('Server error on get post comments');
    }
}

export const addComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const comment = await Comment.create({
            post: req.params.postId,
            author: req.user.id,
            text: req.body.text,
        });

        return res.status(201).json({ success: true, data: { comment } });
    } catch (err) {
        console.error('Error on add post comment: ', err.stack);
        res.sendError('Server error on add post comment');
    }
}

export const editComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const comment = await Comment.findById(req.params.id).exec();

        const data = matchedData(req, { locations: ['body'] });
        for (let field in data) {
            comment[field] = data[field];
        }

        comment.updatedAt = new Date();

        await comment.save();

        return res.json({ success: true, data: { comment } });
    } catch (err) {
        console.error('Error on add post comment: ', err.stack);
        res.sendError('Server error on add post comment');
    }
}

export const toggleLikeComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const like = await LikeComment.findOne({ comment: req.params.id, liker: req.user.id });
        if (like) {
            await like.deleteOne();
        } else {
            await LikeComment.create({ comment: req.params.id, liker: req.user.id });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('Error on toggle comment like: ', err.stack);
        res.sendError('Server error on toggle comment like');
    }
}