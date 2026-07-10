const {
    downloadContentFromMessage,
    getContentType
} = require("@whiskeysockets/baileys");

module.exports = async function serialize(sock, msg) {

    if (!msg || !msg.key) return null;

    const m = {};

    m.sock = sock;
    m.key = msg.key;
    m.id = msg.key.id;

    m.chat = msg.key.remoteJid || "";
    m.jid = m.chat;

    m.sender =
        msg.key.participant ||
        msg.key.remoteJid ||
        "";

    if (m.sender.endsWith("@lid")) {
        const pn = msg.key.participantPn;
        if (pn) {
            m.sender = pn + "@s.whatsapp.net";
        }
    }

    if (m.chat.endsWith("@lid")) {
        m.chat = m.sender;
    }

    m.from = msg.key.remoteJid;
    m.fromMe = msg.key.fromMe;

    m.isGroup = m.chat.endsWith("@g.us");
    m.isChannel = m.chat.endsWith("@newsletter");

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

    // Universal Reply
    m.reply = async (content, options = {}) => {

        if (typeof content === "string") {

            return await sock.sendMessage(
                m.chat,
                {
                    text: content,
                    ...options
                },
                {
                    quoted: msg
                }
            );

        }

        return await sock.sendMessage(
            m.chat,
            {
                ...content
            },
            {
                quoted: msg
            }
        );

    };

    // React
    m.react = async (emoji) => {

        return await sock.sendMessage(
            m.chat,
            {
                react: {
                    text: emoji,
                    key: msg.key
                }
            }
        );

    };

    // Download Media
    m.download = async () => {

        const type = getContentType(msg.message);

        const stream = await downloadContentFromMessage(
            msg.message[type],
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
