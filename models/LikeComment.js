import mongoose from 'mongoose';

const likeCommentSchema = new mongoose.Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
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

likeCommentSchema.index({ comment: 1, liker: 1 }, { unique: true });

const LikeComment = mongoose.model('LikeComment', likeCommentSchema);

export default LikeComment;