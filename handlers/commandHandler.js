const commands = require("../lib/command");
const config = require("../config");

module.exports = async (sock, m) => {

    try {

        if (!m.body) return;

        const prefix = config.bot.prefix || ".";

        if (!m.body.startsWith(prefix)) return;

        const args = m.body
            .slice(prefix.length)
            .trim()
            .split(/ +/);

        const cmd = args.shift().toLowerCase();

        const command = commands.get(cmd);

        if (!command) return;

        //===========================
        // BOT MODE
        //===========================

        const mode = config.settings.mode;

        if (mode === "private" && !m.isOwner) {
            return;
        }

        if (mode === "self" && !m.fromMe) {
            return;
        }

        if (mode === "group" && !m.isGroup) {
            return;
        }

        //===========================
        // COMMAND RESTRICTIONS
        //===========================

        if (command.owner && !m.isOwner) {
            return m.reply("❌ This command is only for the bot owner.");
        }

        if (command.group && !m.isGroup) {
            return m.reply("❌ This command only works in groups.");
        }

        if (command.private && m.isGroup) {
            return m.reply("❌ This command only works in private chat.");
        }

        //===========================
        // RUN COMMAND
        //===========================

        await command.execute(sock, m, args);

    } catch (err) {

        console.error(err);

    }

};
