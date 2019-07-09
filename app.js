const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

const Boteezy = require('./models/Boteezy');

mongoose.connect('mongodb://localhost:27017/boteezys31', {useNewUrlParser: true});

const token = require('./helpers/token');

const bot = new TelegramBot(token, {polling: true});

/**
 * @msg - contains information about the message and how it is used
 * @match - for regular expressions
 */
bot.onText(/\/start/, function (msg, match) {
    bot.sendMessage(msg.chat.id, msg.from.first_name + ' ' + msg.from.last_name + ', hello!')
    bot.sendMessage(msg.chat.id, 'Write /help');
});

bot.onText(/\/help/, function (msg, match) {
    bot.sendMessage(msg.chat.id, '/create <date>^<text>');
    bot.sendMessage(msg.chat.id, '/all');
    bot.sendMessage(msg.chat.id, '/delete <id>');
});

bot.onText(/\/create (.+)/, async function (msg, match) {
    const authorId = msg.from.id;
    const chatId = msg.chat.id;
    const fullText = match[1].split('^');
    const date = new Date(fullText[0]);
    const text = fullText[1];
    date.setUTCHours(date.getUTCHours() + 3);
    const reminder = await Boteezy.create({
        text: text,
        authorId: authorId,
        chatId: chatId,
        date: date,
        checked: false
    });
    bot.sendMessage(chatId, 'Reminder created!!')
});

bot.onText(/\/all/, async function (msg, match) {
    const reminders = await Boteezy.find({checked: false, authorId: msg.from.id});
    bot.sendMessage(msg.chat.id, reminders + ':(');
});

bot.onText(/\/delete (.+)/, async function (msg, match) {
    await Boteezy.findByIdAndRemove(match[1]);
    bot.sendMessage(msg.chat.id, 'Removed notification!')

});

setInterval(async function () {
    const date = new Date();
    date.setUTCHours(date.getUTCHours() + 3);
    const reminders = await Boteezy.find({checked: false, date: {$lte: date}});
    await Boteezy.update({_id: reminders}, {checked: true}, {multi: true});
    for (const reminder of reminders) {
        bot.sendMessage(reminder.chatId, reminder.text);
    }
}, 5000);
