var Discord = require('discord.js');
var auth = require('./auth.json');
var giantbomb = require('giantbomb');

var bot = new Discord.Client();

bot.once('ready', () => {
  console.log('Connected');
  console.log('Logged in as: ');
  console.log(bot.username + ' - (' + bot.id + ')');
});

// ********************** COMMAND LIST **************
function listCommands() {
  const commandsEmbed = new Discord.RichEmbed()
    .setTitle('Available Commands')
    .setDescription(
      "!countdown -> how long until wings?\n" +
      "!game-lookup <name> -> can you really not figure out what this does?")
    .setColor(0x326FD2);
  return commandsEmbed;
}
// ********************** COMMAND LIST **************

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
    var message = [];
    for (var i = 0; i < json.number_of_total_results; ++i) {
      var result = json.results[i];
      const embed = new Discord.RichEmbed()
        .setTitle("**" + result.name + "**" + " (" + getDate(result.original_release_date) + ")")
        .setColor(0x00AE86)
        .setDescription(result.deck)
        .setFooter('Last updated')
        .setTimestamp(result.date_last_updated)
        .setThumbnail(result.image.original_url)
        .setURL(result.site_detail_url);
      message.push(embed);
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
  if (Array.isArray(message)) {
    for (var i = 0; i < message.length; ++i) {
      channel.send(message[i])
        .then(console.log)
        .catch(console.error);
    }
  }
  else {
    channel.send(message);
  }
}

bot.on('message', message => {
  var content = message.content;
  if (content.substring(0,1) == '!') {
    var args = content.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);
    switch(cmd) {
      case 'commands':
        sendMessage(message.channel, listCommands());
        break;
      case 'countdown':
        sendMessage(message.channel, timeToWings());
        break;
      case 'game-lookup':
        lookupGame(message.channel, args.join(' '));
        break;
      default:
        sendMessage(message.channel, 'I think ' + message.author.username + ' is drunk already');
    }
  }
});

bot.login(auth.token);
