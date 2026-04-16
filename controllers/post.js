import { validationResult, matchedData } from 'express-validator';

import Post from '../models/Post.js';
import LikePost from '../models/LikePost.js';
import Comment from '../models/Comment.js';
import Follow from '../models/Follow.js';

export const getPosts = async (req, res) => {
    try {
        const posts = await Post
            .find()
            .populate('author', ['_id', 'username', 'picture'])
            .populate('likesCount')
            .populate('commentsCount')
            .exec()
            ;
        for (const post of posts) {
            post.isLiked = !!(await LikePost.exists({ post: post._id, liker: req.user.id }));
            post.author.isFollowed = !!(await Follow.exists({ followed: post.author._id, follower: req.user.id }));
            post.firstComments = await Comment
                .find({ post: post._id })
                .populate('author', ['username'])
                .limit(2)
                .exec()
                ;
        }

        return res.json({ data: { posts } });
    } catch (err) {
        console.error('Error on get all posts: ', err.stack);
        res.sendError('Server error on get all posts');
    }
}

export const getRandomPosts = async (_, res) => {
    try {
        const posts = await Post.aggregate([
            { $sample: { size: 100 } },
            { $project: { image: 1 } },
        ]);

        return res.json({ data: { posts } });
    } catch (err) {
        console.error('Error on get random posts: ', err.stack);
        res.sendError('Server error on get random posts');
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const userId = req.params.userId || req.user.id;
        if (!userId) {
            throw new Error('User ID not found in request');
        }

        const posts = await Post
            .find({ author: userId })
            .select({ image: 1 })
            .exec()
            ;

        return res.json({ data: { posts } });
    } catch (err) {
        console.error('Error on get posts by user: ', err.stack);
        res.sendError('Server error on get posts by user');
    }
}

export const getPost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const post = await Post
            .findById(req.params.id)
            .populate('author', ['_id', 'username', 'picture'])
            .populate('likesCount')
            .exec()
            ;
        post.isLiked = !!(await LikePost.exists({ post: post._id, liker: req.user.id }));

        return res.json({ data: { post } });
    } catch (err) {
        console.error('Error on get post: ', err.stack);
        res.sendError('Server error on get post');
    }
}

export const createPost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        if (!req.file) {
            res.sendError('Post image is required', 422);
        }
        const base64Encoded = req.file.buffer.toString('base64');
        const post = await Post.create({
            text: req.body.text,
            image: `data:${req.file.mimetype};base64,${base64Encoded}`,
            author: req.user.id,
        });

        return res.status(201).json({ success: true, data: { post } });
    } catch (err) {
        console.error('Error on create post: ', err.stack);
        res.sendError('Server error on create post');
    }
}

export const updatePost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const post = await Post.findById(req.params.id).exec();

        const data = matchedData(req, { locations: ['body'] });
        for (let field in data) {
            post[field] = data[field];
        }

        if (req.file) {
            const base64Encoded = req.file.buffer.toString('base64');
            post.image = `data:${req.file.mimetype};base64,${base64Encoded}`;
        }

        post.updatedAt = new Date();

        await post.save();

        return res.json({ success: true, data: { post } });
    } catch (err) {
        console.error('Error on update post: ', err.stack);
        res.sendError('Server error on update post');
    }
}

export const deletePost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        await Post.findByIdAndDelete(req.params.id);

        return res.json({ success: true });
    } catch (err) {
        console.error('Error on delete post: ', err.stack);
        res.sendError('Server error on delete post');
    }
}

export const toggleLikePost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const like = await LikePost.findOne({ post: req.params.id, liker: req.user.id });
        if (like) {
            await like.deleteOne();
        } else {
            await LikePost.create({ post: req.params.id, liker: req.user.id });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('Error on toggle post like: ', err.stack);
        res.sendError('Server error on toggle post like');
    }
}