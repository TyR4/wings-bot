var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

var bot = new Discord.Client({
  token:auth.token,
  autorun:true
});

bot.on('ready', function (event) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});

function sendMessage(channelID, message) {
  bot.sendMessage({
    // to: '442000366599405568',
    to: channelID,
    message: timeToWings(),
    typing: true
  });
}

function thursday() {
  var ret = new Date();
  ret.setDate(ret.getDate() + (4 - 1 - ret.getDay() + 7) % 7 + 1);
  ret.setHours(19);
  return ret;
}

function timeToWings() {
  var howLong = ""
  var hoursToWings = (thursday()-Date.now())/(1000*3600);
  var days = Math.floor(hoursToWings/24);
  if (days >= 1)
    howLong = howLong + days + " days ";
  howLong = howLong + (hoursToWings % 24) + " hours until wings";
  return howLong;
}

bot.on('message', function (user, userID, channelID, message, event) {
  if (message.substring(0,1) == '!') {
    var args = message.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);
    switch(cmd) {
      case 'countdown':
        sendMessage(channelID, timeToWings());
        break;
    }
  }
});
