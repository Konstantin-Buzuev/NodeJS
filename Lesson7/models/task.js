const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String
    },
    comment: {
        type: String
    },
    redline: {
        type: String
    },
    deadline: {
        type: String
    },
    completed: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Task', taskSchema, 'tasks');