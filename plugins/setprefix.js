const { getSettings, saveSettings } = require("../lib/settings");

module.exports = {
    name: "setprefix",
    aliases: ["prefix"],
    category: "Owner",
    description: "Change the bot prefix.",
    usage: ".setprefix <new prefix>",
    owner: true,

    async execute(sock, m, args) {

        const prefix = args[0];

        if (!prefix) {
            return m.reply("❌ Usage: .setprefix <new prefix>");
        }

        const settings = getSettings();

        settings.prefix = prefix;

        saveSettings(settings);

        await m.reply(
`╭━━〔 ⚙️ Kenya-Ultra Settings 〕━━╮

✅ Setting Updated

⚙️ Setting : Prefix
📌 New Value : ${prefix}

╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
