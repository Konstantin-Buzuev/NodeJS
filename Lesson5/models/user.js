const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    lastName: { type: String, default: 'Pupkin' },
    avatar: String,
    email: String,
    bio: String,
});

module.exports = mongoose.model('User', userSchema, 'users');
