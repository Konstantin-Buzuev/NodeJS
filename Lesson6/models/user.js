const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const saltRounds = 13;

const userSchema = new Schema({
    username: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    password: {
        type: String
    }, // bcryptjs
});

userSchema.pre('save', function (next) { // hook
    if (this.isModified('password')) {
        const salt = bcrypt.genSaltSync(saltRounds);
        this.password = bcrypt.hashSync(this.password, salt);
    }

    next();
});
userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compareSync(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema, 'users');