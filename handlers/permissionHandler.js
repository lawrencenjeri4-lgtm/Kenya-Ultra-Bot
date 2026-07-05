const config = require("../config");

module.exports = async (sock, m, command) => {

    // Owner only
    if (command.owner && !m.isOwner) {
        await sock.sendMessage(m.chat, {
            text: "❌ This command is only available to the bot owner."
        });
        return false;
    }

    // Group only
    if (command.group && !m.isGroup) {
        await sock.sendMessage(m.chat, {
            text: "❌ This command can only be used in groups."
        });
        return false;
    }

    // Private only
    if (command.private && m.isGroup) {
        await sock.sendMessage(m.chat, {
            text: "❌ This command can only be used in private chat."
        });
        return false;
    }

    // User must be group admin
    if (command.admin && !m.isAdmin) {
        await sock.sendMessage(m.chat, {
            text: "❌ You must be a group admin to use this command."
        });
        return false;
    }

    // Bot must be group admin
    if (command.botAdmin && !m.isBotAdmin) {
        await sock.sendMessage(m.chat, {
            text: "❌ I need to be an admin to use this command."
        });
        return false;
    }

    // NSFW commands
    if (command.nsfw && !config.nsfw) {
        await sock.sendMessage(m.chat, {
            text: "🚫 NSFW commands are disabled."
        });
        return false;
    }

    return true;
};
