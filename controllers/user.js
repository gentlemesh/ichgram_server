import { validationResult } from 'express-validator';
import escapeStringRegexp from 'escape-string-regexp';

import User from '../models/User.js';
import Follow from '../models/Follow.js';

export const getUsers = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const users = await User
            .find()
            .select(['_id', 'username', 'picture'])
            .exec()
            ;

        return res.json({ data: { users } });
    } catch (err) {
        console.error('Error on get users: ', err.stack);
        res.sendError('Server error on get users');
    }
}

export const getUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const userId = req.params.id || req.user.id;
        if (!userId) {
            throw new Error('User ID not found in request');
        }

        const user = await User
            .findById(userId)
            .select(['_id', 'username', 'picture'])
            .exec()
            ;

        return res.json({ data: { user } });
    } catch (err) {
        console.error('Error on get user: ', err.stack);
        res.sendError('Server error on get user');
    }
}

export const searchUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const $regex = escapeStringRegexp(req.query.q);
        const users = await User
            .find({ username: { $regex } })
            .select(['_id', 'username', 'picture'])
            .exec()
            ;

        return res.json({ data: { users } });
    } catch (err) {
        console.error('Error on search user: ', err.stack);
        res.sendError('Server error on search user');
    }
}

export const followUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        await Follow.create({ followed: req.params.id, follower: req.user.id });

        return res.json({ success: true });
    } catch (err) {
        console.error('Error on add follow link: ', err.stack);
        res.sendError('Server error on add follow link');
    }
}

export const unfollowUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        await Follow.findOneAndDelete({ followed: req.params.id, follower: req.user.id });

        return res.json({ success: true });
    } catch (err) {
        console.error('Error on remove follow link: ', err.stack);
        res.sendError('Server error on remove follow link');
    }
}