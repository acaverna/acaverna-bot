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
  channels: [ChannelName, "pokemaobr"],
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
const modsDaCaverna = JSON.parse(
  fs.readFileSync("./data/mods.json", { encoding: "utf8", flag: "r" })
);
const streamersOn = [];
const tempoDivulgacao = 600000;
const tempoAtualizacao = 500000;

function recivedMessage(target, context, msg, bot) {
  if (bot) {
    return;
  }

  let { username } = context;
  let command = msg.split(" ");

  if (modsDaCaverna.mods.includes(username) && command[0] === "!blocklist") {
    let banido = command[1].replace("@", "");
    let motivo = msg.replace(`!blocklist ${command[1]}`, "");

    baneViewer(banido, motivo);
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
            client.say(
              nomeStreamer,
              `/me Olá @${nomeStreamer} a Caverna deseja uma live Denomenal para você VirtualHug VirtualHug`
            );
            opts.channels.push(nomeStreamer);
          }
        } else {
          if (streamersOn.includes(nomeStreamer)) {
            opts.channels.splice(opts.channels.indexOf(nomeStreamer), 1);
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

function baneViewer(username, motivo) {
  streamers.forEach((streamer) => {
    client.say(streamer.name, `/ban ${username} ${motivo}`);
  });
  client.say("pokemaobr", `/ban ${username} ${motivo}`);
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
