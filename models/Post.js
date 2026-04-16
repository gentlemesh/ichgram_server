import mongoose from 'mongoose';

import Comment from './Comment.js';
import LikePost from './LikePost.js';

const postSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxLength: 2200,
    },
    image: {
        type: String,
        required: true,
        match: [/^data\:image\/(?:png|jpg|jpeg|gif|webp)\;base64\,/, 'Incorrect encoded image string'],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
            message: 'Post `updatedAt` datetime must be later than `createdAt` datetime',
        },
    },
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

postSchema.virtual('likesCount', {
    ref: 'LikePost',
    localField: '_id',
    foreignField: 'post',
    count: true,
});
postSchema.virtual('isLiked') // "virtual" virtual — a special hack to set additional field on document instance from outside (usage: doc.isLiked = true/false)
    .get(function () { return this.__isLiked })
    .set(function (isLiked) { this.__isLiked = isLiked; })
    ;

postSchema.virtual('commentsCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post',
    count: true,
});
postSchema.virtual('firstComments')
    .get(function () { return this.__firstComments })
    .set(function (firstComments) { this.__firstComments = firstComments; })
    ;

postSchema.pre('findOneAndDelete', async function () {
    const id = this._id || this.getQuery()._id;

    const comments = await Comment.find({ post: id });
    for (const comment of comments) {
        await comment.deleteOne();
    }

    await LikePost.deleteMany({ post: id });
});

const Post = mongoose.model('Post', postSchema);

export default Post;