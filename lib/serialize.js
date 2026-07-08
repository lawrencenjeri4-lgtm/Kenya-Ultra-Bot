const {
    downloadContentFromMessage,
    getContentType
} = require("@whiskeysockets/baileys");

module.exports = async function serialize(sock, msg) {

    if (!msg) return null;
   if (!msg.key) return null; 

    const m = {};

    m.sock = sock;
    m.key = msg.key;
    m.id = msg.key.id;
    m.chat = msg.key.remoteJid;
    m.jid = m.chat;

if (m.chat.endsWith("@lid")) {
    m.chat = m.sender;
}
    m.from = msg.key.remoteJid;
    m.chat = msg.key?.remoteJid || "";

m.isGroup = m.chat.endsWith("@g.us");
m.isChannel = m.chat.endsWith("@newsletter");
    m.sender =
    msg.key?.participant ||
    msg.key?.remoteJid ||
    "";

if (m.sender.endsWith("@lid")) {
    const pn = msg.key.participantPn;
    if (pn) m.sender = pn + "@s.whatsapp.net";
}
    m.fromMe = msg.key.fromMe;

    m.message = msg.message || {};

    m.type = getContentType(m.message);

    const type = getContentType(m.message);

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
