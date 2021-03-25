const tmi = require("tmi.js");
const dotenv = require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const BotName = process.env.NOME_BOT;
const ChannelName = process.env.NOME_CANAL;
const opts = {
  identity: {
    username: BotName,
    password: process.env.TOKEN,
  },
  channels: [ChannelName],
};
const client = new tmi.client(opts);
const streamers = JSON.parse(
  fs.readFileSync("./data/streamers.json", { encoding: "utf8", flag: "r" })
);
const streamersDaCaverna = JSON.parse(
  fs.readFileSync("./data/streamersDaCaverna.json", {
    encoding: "utf8",
    flag: "r",
  })
);
const streamersOn = [];
const tempoDivulgacao = 600000;
const tempoAtualizacao = 500000;

function recivedMessage(target, context, msg, bot) {
  if (bot) {
    return;
  }
}

function atualizaStreamers() {
  streamers.forEach((streamer) => {
    axios
      .get("https://api.twitch.tv/kraken/streams/" + streamer.id, {
        headers: {
          Accept: "application/vnd.twitchtv.v5+json",
          "Client-ID": process.env.CLIENT_ID,
        },
      })
      .then(function (response) {
        const nomeStreamer = streamer.name;

        if (response.data.stream) {
          if (!streamersOn.includes(nomeStreamer)) {
            streamersOn.push(nomeStreamer);
          }
        } else {
          if (streamersOn.includes(nomeStreamer)) {
            streamersOn.splice(streamersOn.indexOf(nomeStreamer), 1);
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });
}

function divulgaStreamer() {
  let streamerSorteado =
    streamersDaCaverna[Math.floor(Math.random() * streamersDaCaverna.length)];

  streamersOn.forEach((streamer) => {
    if (streamer !== streamerSorteado.name) {
      client.say(
        streamer,
        `/me ${streamerSorteado.description}. Conheça o canal https://twitch.tv/${streamerSorteado.name}`
      );
      client.say(streamer, `!sh-so ${streamerSorteado.name}`);
    }
  });
}

setInterval(() => {
  atualizaStreamers();
}, tempoAtualizacao);

setInterval(() => {
  divulgaStreamer();
}, tempoDivulgacao);

clearInterval(atualizaStreamers);
clearInterval(divulgaStreamer);

client.on("message", recivedMessage);
client.on("connected", () => {
  console.log("Acarvena tá on!");
});

client.connect();
