const {
    downloadContentFromMessage,
    getContentType
} = require("@whiskeysockets/baileys");

module.exports = async function serialize(sock, msg) {

    if (!msg || !msg.key) return null;

    const m = {};

    // Original Baileys message
    m.msg = msg;

    m.sock = sock;
    m.key = msg.key;
    m.id = msg.key.id;

    m.chat = msg.key.remoteJid || "";
    m.from = m.chat;

    m.isGroup = m.chat.endsWith("@g.us");
    m.isChannel = m.chat.endsWith("@newsletter");

    m.sender =
        msg.key.participant ||
        msg.key.remoteJid ||
        "";

    // Convert LID sender to WhatsApp JID when possible
    if (m.sender.endsWith("@lid") && msg.key.participantPn) {
        m.sender = msg.key.participantPn + "@s.whatsapp.net";
    }

    // For LID private chats, use sender as chat
    if (m.chat.endsWith("@lid")) {
        m.chat = m.sender;
    }

    m.fromMe = msg.key.fromMe;

    m.message = msg.message || {};

    const type = getContentType(m.message);
    m.type = type;

    m.body =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        m.message?.ephemeralMessage?.message?.conversation ||
        m.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
        m.message?.ephemeralMessage?.message?.imageMessage?.caption ||
        m.message?.ephemeralMessage?.message?.videoMessage?.caption ||
        m.message?.viewOnceMessage?.message?.conversation ||
        m.message?.viewOnceMessage?.message?.extendedTextMessage?.text ||
        m.message?.[type]?.text ||
        "";

    m.text = m.body;

    m.pushName = msg.pushName || "User";

    m.reply = async (text, options = {}) => {
        return await sock.sendMessage(
            m.chat,
            {
                text,
                ...options
            },
            {
                quoted: m.msg
            }
        );
    };

    m.react = async (emoji) => {
        return await sock.sendMessage(
            m.chat,
            {
                react: {
                    text: emoji,
                    key: m.key
                }
            }
        );
    };

    m.download = async () => {

        const type = getContentType(m.message);

        if (!type) return null;

        const stream = await downloadContentFromMessage(
            m.message[type],
            type.replace("Message", "")
        );

        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        return buffer;
    };

    return m;
};
