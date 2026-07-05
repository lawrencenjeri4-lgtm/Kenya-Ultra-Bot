const {
    downloadContentFromMessage,
    getContentType
} = require("@whiskeysockets/baileys");

module.exports = async function serialize(sock, msg) {

    if (!msg) return null;

    const m = {};

    m.sock = sock;
    m.key = msg.key;
    m.id = msg.key.id;
    m.chat = msg.key.remoteJid;
    m.from = msg.key.remoteJid;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = msg.key.participant || msg.key.remoteJid;
    m.fromMe = msg.key.fromMe;

    m.message = msg.message || {};

    m.type = getContentType(m.message);

    m.body =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        "";

    m.text = m.body;

    m.reply = async (text, options = {}) => {
        return await sock.sendMessage(
            m.chat,
            {
                text,
                ...options
            },
            {
                quoted: msg
            }
        );
    };

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
