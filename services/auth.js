import jwt from 'jsonwebtoken';
import { config as loadEnv } from 'dotenv';

loadEnv();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined!');
}
const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

export const getTokenForUser = user => jwt.sign(
    {
        id: user._id,
    },
    jwtSecret,
    { expiresIn }
);