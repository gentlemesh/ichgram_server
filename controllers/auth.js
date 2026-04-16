import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';

import User from '../models/User.js';
import { getTokenForUser } from '../services/auth.js';
import mail from '../services/mail.js';

export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const { username_email, password } = req.body;

        const user = await User
            .findOne({ $or: [{ email: username_email }, { username: username_email }] })
            .select({ password: 1 })
            .exec()
            ;
        if (!user) {
            res.sendError('Incorrect username, email or password', 401);
        }

        const isPasswordOk = await bcrypt.compare(password, user.password);
        if (!isPasswordOk) {
            res.sendError('Incorrect username, email or password', 401);
        }

        return res.json({ token: getTokenForUser(user) });
    } catch (err) {
        console.error('Error on login attempt: ', err.stack);
        res.sendError('Server error on login attempt');
    }
}

export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const { email, full_name, username, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, full_name, username, password: passwordHash });

        res.status(201).json({ user: newUser, token: getTokenForUser(newUser) });
    } catch (err) {
        console.error('Error on register attempt: ', err.stack);
        res.sendError('Server error on register attempt');
    }
}

export const restore = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.validationStatus().json({ errors: errors.array() });
        }

        const input = req.body.input;

        const user = await User.findOne({ $or: [{ email: input }, { username: input }] }).exec();
        if (!user) {
            res.sendError('Incorrect username, email or password', 401);
        }

        const referrer = req.get('Referrer');
        // @TODO: Implement more safe approach
        const restoreLink = `${referrer}auth/autologin/${user._id}`;

        const success = await mail(
            user.email,
            'Ichgram password restore',
            `<p><strong>Hello!</strong></p>`
            + `<br />`
            + `<p>Password restore link: <a href="${restoreLink}">${restoreLink}</a></p>`
            ,
            true
        );

        return res.json({ success });
    } catch (err) {
        console.error('Error on login attempt: ', err.stack);
        res.sendError('Server error on restore attempt');
    }
}

export const autologin = async (req, res) => {
    try {
        validationResult(req).throw();

        // @TODO: Implement more safe approach
        const user = await User.findById(req.params.id).exec();

        return res.json({ token: getTokenForUser(user) });
    } catch (err) {
        if ('errors' in err) {
            res.sendError('Incorrect restore attempt request', 401);
        } else {
            console.error('Error on login attempt: ', err.stack);
            res.sendError('Server error on restore attempt');
        }
    }
}