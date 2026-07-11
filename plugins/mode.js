const { getSettings, saveSettings } = require("../lib/settings");

module.exports = {
    name: "setmode",
aliases: ["mode"],
    category: "Owner",
    description: "Change bot mode.",
    usage: ".mode <public|private|group|self>",
    owner: true,

    async execute(sock, m, args) {

        const mode = (args[0] || "").toLowerCase();

        const modes = ["public", "private", "group", "self"];

        if (!modes.includes(mode)) {
            return m.reply(
`❌ Invalid mode.

Available modes:
• public
• private
• group
• self`
            );
        }

        const settings = getSettings();

        settings.mode = mode;

        saveSettings(settings);

        await m.reply(`✅ Bot mode changed to *${mode.toUpperCase()}*`);
    }
};
