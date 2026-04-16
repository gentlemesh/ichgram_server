import express from 'express';
import path from 'path';
import cors from 'cors';
import { config as loadEnv } from 'dotenv';

import connectDB from './db/connect.js';
import { jsonFormatError, resValidationStatus } from './middleware/response.js';
import { authenticateJWT } from './middleware/authenticateJWT.js';
import { checkUserFromToken } from './middleware/user.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import profileRouter from './routes/profile.js';
import postRouter from './routes/post.js';
import commentRouter from './routes/comment.js';

loadEnv();

const host = process.env.HOST || 'http://localhost';
const port = process.env.PORT || 3333;

const app = express();

const __dirname = import.meta.dirname;

app.listen(port, async () => {
    try {
        await connectDB();
        console.log(`Server is running on ${host}:${port}`);
    } catch (err) {
        console.error('Cannot start server: ', err);
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(jsonFormatError);
app.use(resValidationStatus);

app.use('/auth', authRouter);
app.use('/user', authenticateJWT, checkUserFromToken, userRouter);
app.use('/profile', authenticateJWT, checkUserFromToken, profileRouter);
app.use('/post', authenticateJWT, checkUserFromToken, postRouter);
app.use('/comment', authenticateJWT, checkUserFromToken, commentRouter);

app.get('/', (_req, res) => {
    res.send('Ichgram App backend');
});