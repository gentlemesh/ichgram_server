import mongoose from 'mongoose';

import User from '../models/User.js';

export const checkUserFromToken = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!mongoose.isValidObjectId(userId)) {
            res.sendError('Invalid current user id', 400);
        }

        const isExists = await User.exists({ _id: req.user.id });
        if (!isExists) {
            res.sendError('Current user not found', 404);
        }

        next();
    } catch (err) {
        console.error('Error with current user by token: ', err.stack);
        res.sendError('Server error with current user by token');
    }
}