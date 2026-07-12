const axios = require("axios");

module.exports = {

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    runtime(seconds) {

        seconds = Number(seconds);

        const d = Math.floor(seconds / (3600 * 24));

        const h = Math.floor(seconds % (3600 * 24) / 3600);

        const m = Math.floor(seconds % 3600 / 60);

        const s = Math.floor(seconds % 60);

        return `${d}d ${h}h ${m}m ${s}s`;

    },

    async getJson(url) {

        const { data } = await axios.get(url);

        return data;

    },

    // Returns the jid of a mentioned user (@tag) or a quoted/replied-to user.
    // Used by kick/promote/demote/block/etc to figure out who the command targets.
    getTargetJid(m) {

        if (m.mentionedJid && m.mentionedJid.length > 0) {
            return m.mentionedJid[0];
        }

        if (m.quoted && m.quoted.sender) {
            return m.quoted.sender;
        }

        return null;

    },

    // Returns the jids of all group admins (admin + superadmin).
    async getGroupAdmins(sock, chat) {

        const metadata = await sock.groupMetadata(chat);

        return metadata.participants
            .filter(p => p.admin === "admin" || p.admin === "superadmin")
            .map(p => p.id);

    },

    // Returns the bot's own jid in the standard @s.whatsapp.net form.
    getBotJid(sock) {
        return sock.user.id.split(":")[0] + "@s.whatsapp.net";
    }

};
