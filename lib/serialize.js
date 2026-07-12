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

    // ==========================
    // Owner Check
    // ==========================

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

            const normalize = (jid = "") =>
                jid
                    .split(":")[0]
                    .replace("@lid", "")
                    .replace("@s.whatsapp.net", "");

            const senderId = normalize(m.sender);
            const botId = normalize(sock.user.id);

            const me = metadata.participants.find(
                p => normalize(p.id) === senderId
            );

            const bot = metadata.participants.find(
                p => normalize(p.id) === botId
            );

            m.isAdmin = ["admin", "superadmin"].includes(me?.admin);
            m.isBotAdmin = ["admin", "superadmin"].includes(bot?.admin);

            // Debug
            console.log("━━━━━━━━ GROUP DEBUG ━━━━━━━━");
            console.log("Sender:", senderId);
            console.log("Bot:", botId);
            console.log("isAdmin:", m.is
