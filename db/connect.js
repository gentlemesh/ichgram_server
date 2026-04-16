import mongoose from 'mongoose';
import { config as loadEnv } from 'dotenv';

loadEnv();

const mongoUri = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB: ', err);
        process.exit(1);
    }
}

export default connectDB;