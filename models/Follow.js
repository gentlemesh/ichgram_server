import mongoose from 'mongoose';

const followSchema = new mongoose.Schema({
    followed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    versionKey: false,
});

followSchema.index({ followed: 1, follower: 1 }, { unique: true });

const Follow = mongoose.model('Follow', followSchema);

export default Follow;
