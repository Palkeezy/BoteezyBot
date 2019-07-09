const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BoteezySchema = new Schema({
    text: String,
    date: Date,
    authorId: String,
    chatId: String,
    checked: Boolean
});

module.exports = mongoose.model('boteezy', BoteezySchema);
