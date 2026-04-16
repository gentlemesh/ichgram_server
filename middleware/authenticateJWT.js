import jwt from 'jsonwebtoken';
import { config as loadEnv } from 'dotenv';

loadEnv();

const jwtSecret = process.env.JWT_SECRET;

export function authenticateJWT(req, res, next) {
    try {
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined!');
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No valid authorization header');
        }

        const token = authHeader.substring(7);
        if (!token) {
            throw new Error('Token is empty');
        }

        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;

        next();
    } catch (err) {
        console.error('Error with JWT: ', err.stack);
        res.sendError('Absent, incorrect or outdated token', 401);
    }
}