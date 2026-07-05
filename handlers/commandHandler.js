const commands = require("../lib/command");

module.exports = async (sock, m) => {
    try {
        if (!m.body) return;

        const prefix = process.env.PREFIX || ".";

        if (!m.body.startsWith(prefix)) return;

        const args = m.body.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        const command = commands.get(cmd);

        if (!command) return;

        if (command.owner && !m.isOwner) {
            return sock.sendMessage(m.chat, {
                text: "❌ This command is for the bot owner only."
            });
        }

        if (command.group && !m.isGroup) {
            return sock.sendMessage(m.chat, {
                text: "❌ This command can only be used in groups."
            });
        }

        if (command.private && m.isGroup) {
            return sock.sendMessage(m.chat, {
                text: "❌ This command can only be used in private chat."
            });
        }

        await command.execute(sock, m, args);

    } catch (err) {
        console.error(err);
    }
};
