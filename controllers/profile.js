import { validationResult, matchedData } from 'express-validator';

import User from '../models/User.js';
import Follow from '../models/Follow.js';

export const getProfile = async (req, res) => {
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
            .populate(['followersCount', 'followsCount'])
            .exec()
            ;
        user.isFollowed = !!(await Follow.exists({ followed: user._id, follower: req.user.id }));

        return res.json({ data: { profile: user } });
    } catch (err) {
        console.error('Error on get user\'s profile: ', err.stack);
        res.sendError('Server error on get profile');
    }
}

export const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const user = await User.findById(req.user.id).exec();

        const data = matchedData(req, { locations: ['body'] });
        for (let field in data) {
            user[field] = data[field];
        }

        if (req.file) {
            const base64Encoded = req.file.buffer.toString('base64');
            user.picture = `data:${req.file.mimetype};base64,${base64Encoded}`;
        }

        await user.save();

        return res.json({ success: true });
    } catch (err) {
        console.error('Error on update user\'s profile: ', err.stack);
        res.sendError('Server error on update profile');
    }
}