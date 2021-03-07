const NoodleJS = require("noodle.js");
const { Telegraf } = require("telegraf");

const client = new NoodleJS({
  name: "Mumbot",
  password: process.env.MUMBLE_SERVER_PWD,
  url: process.env.MUMBLE_SERVER_URL,
});
const bot = new Telegraf(process.env.BOT_TOKEN);

/* Mumble */
client.on("ready", (info) =>
  client.sendMessage("Bonjour, je relais les activitées de mumble.")
);

/* Telegram */
bot.start((ctx) => {
  if (
    !process.env.TELEGRAM_ADMIN.split(" ").includes(
      ctx.update.message.from.username
    )
  ) {
    return ctx.reply("Vous n'êtes pas autorisé à utiliser ce bot.");
  }

  ctx.reply("Bonjour, je relais les activitées de mumble.", {
    disable_notification: true,
  });

  client.on("userJoin", (user) =>
    ctx.reply(`${user.name} s'est connecté à mumble.`, {
      disable_notification: true,
    })
  );

  client.on("userDisconnect", (user) =>
    ctx.reply(`${user.name} s'est déconnecté de mumble.`, {
      disable_notification: true,
    })
  );

  client.on("message", (message) =>
    ctx.reply(`[Mumble] [${message.sender.name}] : ${message.content}`)
  );
});

bot.on("voice", async (ctx) => {
  const { file_path } = await bot.telegram.getFile(ctx.message.voice.file_id);
  const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file_path}`;
  return client.voiceConnection.playFile(fileUrl);
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.launch();
client.connect();
