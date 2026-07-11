const commands = require("../lib/command");
const config = require("../config");

module.exports = async (sock, m) => {
    try {
        if (!m.body) return;

        const prefix = process.env.PREFIX || ".";

        if (!m.body.startsWith(prefix)) return;

        const args = m.body
            .slice(prefix.length)
            .trim()
            .split(/ +/);

        const cmd = args.shift().toLowerCase();

        // ==========================
        // Debug Logs
        // ==========================
        console.log("=================================");
        console.log("PREFIX:", prefix);
        console.log("BODY:", m.body);
        console.log("CMD:", cmd);

        const command = commands.get(cmd);

        console.log("FOUND COMMAND:", !!command);

        if (!command) {
            console.log("❌ Command not found");
            return;
        }

        console.log("✅ Executing:", command.name);
        console.log("=================================");

        // ==========================
        // BOT MODE
        // ==========================

        const mode = config.settings?.mode || "public";

        if (mode === "private" && !m.isOwner) return;

        if (mode === "self" && !m.fromMe) return;

        if (mode === "group" && !m.isGroup) return;

        // ==========================
        // Permission Checks
        // ==========================

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

        // ==========================
        // Execute Command
        // ==========================

        await command.execute(sock, m, args);

    } catch (err) {
        console.error("❌ Command Handler Error:");
        console.error(err);
    }
};
