const {
    downloadContentFromMessage,
    getContentType
} = require("@whiskeysockets/baileys");

module.exports = async function serialize(sock, msg) {

    if (!msg || !msg.key) return null;

    const config = require("../config");

    const m = {};

    m.sock = sock;
    m.msg = msg;
    m.key = msg.key;

    m.id = msg.key.id;
    m.chat = msg.key.remoteJid || "";
    m.from = m.chat;
    m.fromMe = msg.key.fromMe;

    m.sender =
        msg.key.participant ||
        msg.key.remoteJid ||
        "";

    // Convert LID sender
    if (m.sender.endsWith("@lid") && msg.key.participantPn) {
        m.sender = msg.key.participantPn + "@s.whatsapp.net";
    }

    // Owner Check
    const ownerNumbers = config.owner.numbers || [];

    const senderNumber = m.sender
        .replace("@s.whatsapp.net", "")
        .replace(/\D/g, "");

    m.isOwner =
        m.fromMe ||
        ownerNumbers.includes(senderNumber);

    // Personal Chats
    if (m.chat.endsWith("@lid")) {
        m.chat = m.sender;
    }

    m.jid = m.chat;

    m.isGroup = m.chat.endsWith("@g.us");
    m.isChannel = m.chat.endsWith("@newsletter");

    // ==========================
    // Group Metadata
    // ==========================

    if (m.isGroup) {

        try {

            const metadata = await sock.groupMetadata(m.chat);

            m.groupMetadata = metadata;
            m.subject = metadata.subject;
            m.participants = metadata.participants;

            const botId =
                sock.user.id.split(":")[0] +
                "@s.whatsapp.net";

            const me = metadata.participants.find(
                p => p.id === m.sender
            );

            const bot = metadata.participants.find(
                p => p.id === botId
            );

            m.isAdmin = !!me?.admin;
            m.isBotAdmin = !!bot?.admin;

        } catch (err) {
            console.error("Group Metadata Error:", err);
        }

    }

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

    // Mentioned Users
    m.mentionedJid =
        m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    // Quoted Message
    const context =
        m.message?.extendedTextMessage?.contextInfo;

    if (context?.participant) {

        m.quoted = {
            sender: context.participant,
            stanzaId: context.stanzaId
        };

    } else {

        m.quoted = null;

    }

    // Reply Helper
    m.reply = async (text, options = {}) => {

        return sock.sendMessage(
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

    // React Helper
    m.react = async (emoji) => {

        return sock.sendMessage(
            m.chat,
            {
                react: {
                    text: emoji,
                    key: msg.key
                }
            }
        );

    };

    // Download Helper
    m.download = async () => {

        const mediaType = getContentType(msg.message);

        const stream = await downloadContentFromMessage(
            msg.message[mediaType],
            mediaType.replace("Message", "")
        );

        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        return buffer;

    };

    return m;

};
