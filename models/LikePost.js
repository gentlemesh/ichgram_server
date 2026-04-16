import mongoose from 'mongoose';

const likePostSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    liker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    versionKey: false,
});

likePostSchema.index({ post: 1, liker: 1 }, { unique: true });

const LikePost = mongoose.model('LikePost', likePostSchema);

export default LikePost;