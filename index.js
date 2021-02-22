const tmi = require("tmi.js");
const dotenv = require("dotenv").config();

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

function recivedMessage(target, context, msg, bot) {
  if (bot) {
    return;
  }

  if (msg == "!caverna") {
    client.say(
      target,
      "/me Uma comunidade voltada para programação em geral com o objetivo de ajudar uns aos outros, estudar coletivamente, e outros. https://discord.io/caverna ⭐Por favor, não se esqueça de passar no canal #regras para liberar o acesso á todas as salas do nosso servidor⭐"
    );
  }
}

client.on("message", recivedMessage);
client.on("connected", () => {
  console.log("Acarvena tá on!");
});

client.connect();
