import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    full_name: {
        type: String,
        required: true,
    },
    picture: {
        type: String,
        match: [/^data\:image\/(?:png|jpg|jpeg|gif|webp)\;base64\,/, 'Incorrect encoded image string'],
    },
    about: {
        type: String,
        maxLength: 150,
    },
    website: {
        type: String,
        match: [/^(?:http|https|ftp)\:\/\/.+\..+/, 'Incorrect URL'],
    },
}, {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

userSchema.virtual('postsCount', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'author',
    count: true,
});
userSchema.virtual('followersCount', {
    ref: 'Follow',
    localField: '_id',
    foreignField: 'followed',
    count: true,
});
userSchema.virtual('followsCount', {
    ref: 'Follow',
    localField: '_id',
    foreignField: 'follower',
    count: true,
});
userSchema.virtual('isFollowed') // "virtual" virtual — a special hack to set additional field on document instance from outside (usage: doc.isFollowed = true/false)
    .get(function () { return this.__isFollowed })
    .set(function (isFollowed) { this.__isFollowed = isFollowed; })
    ;

const User = mongoose.model('User', userSchema);

export default User;
