import mongoose from 'mongoose';

import LikeComment from './LikeComment.js';

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxLength: 500,
    },
    createdAt: {
        type: Date,
        required: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        required: false,
        validate: {
            validator: function (v) {
                if (v === undefined || v === null) return true;
                return v > this.createdAt;
            },
            message: 'Comment `updatedAt` datetime must be later than `createdAt` datetime',
        },
    },
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

commentSchema.index({ post: 1, author: 1 }, { unique: false });

commentSchema.virtual('likesCount', {
    ref: 'LikeComment',
    localField: '_id',
    foreignField: 'comment',
    count: true,
});
commentSchema.virtual('isLiked') // "virtual" virtual — a special hack to set additional field on document instance from outside (usage: doc.isLiked = true/false)
    .get(function () { return this.__isLiked })
    .set(function (isLiked) { this.__isLiked = isLiked; })
    ;

async function deleteCommentLikes() {
    const id = this._id || this.getQuery()._id;
    await LikeComment.deleteMany({ comment: id });
}
commentSchema.pre('findOneAndDelete', deleteCommentLikes);
commentSchema.pre('deleteOne', { document: true, query: false }, deleteCommentLikes);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
