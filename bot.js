var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var giantbomb = require('giantbomb');

var bot = new Discord.Client();

bot.once('ready', () => {
  console.log('Connected');
  console.log('Logged in as: ');
  console.log(bot.username + ' - (' + bot.id + ')');
});

// ********** WINGS COUNTDOWN ************
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
// ********** END WINGS COUNTDOWN ************

// ********** GAME LOOKUP  ************
var gb = giantbomb(auth.gbtoken);

function getDate(dateString) {
    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    var date = new Date(dateString);
    return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function buildMessage(json) {
    var message = "";
    for (var i = 0; i < json.number_of_total_results; ++i) {
        var result = json.results[i];
        message += "**" + result.name + "** (" + getDate(result.original_release_date) + ")\n";
        message += result.deck + "\n\n";
    }
    return message;
}

function lookupGame(channel, message) {
  var gameName = message.replace("!find ", "");
  const config = {
      sortBy: 'original_release_date',
      sortDir: 'asc'
  };
  gb.games.search(gameName, config, (err, res, json) => {
      if (!err) {
          sendMessage(
              channel,
              json.number_of_total_results > 10
                  ? "Buddy, do you have any idea how many " + gameName + " games there are?! You need to narrow it down for me."
                  : json.number_of_total_results === 0
                      ? "That's not a thing."
                      : buildMessage(json));
      }
      else {
          sendMessage(channel, "Something bad happened. I blame you. Or the universe.");
      }
  });
}
// ********** END GAME LOOKUP ************

function sendMessage(channel, message) {
  channel.send(message);
}

bot.on('message', message => {
  var content = message.content;
  if (content.substring(0,1) == '!') {
    var args = content.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);
    switch(cmd) {
      case 'countdown':
        sendMessage(message.channel, timeToWings());
        break;
      case 'game-lookup':
        lookupGame(message.channel, args.join(' '));
        break;
      default:
        sendMessage('I think ' + message.author + ' is drunk already');
    }
  }
});

bot.login(auth.token);
