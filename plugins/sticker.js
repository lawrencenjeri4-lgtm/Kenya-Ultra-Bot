const sharp = require("sharp");
const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");

// Pulls a usable image buffer either from the message itself (sent with the
// command as a caption) or from a quoted/replied-to message.
async function getMediaBuffer(m) {

    if (["imageMessage", "videoMessage"].includes(m.type)) {
        return { buffer: await m.download(), type: m.type };
    }

    if (m.quoted && m.quoted.message) {

        const quotedType = getContentType(m.quoted.message);

        if (["imageMessage", "videoMessage"].includes(quotedType)) {

            const stream = await downloadContentFromMessage(
                m.quoted.message[quotedType],
                quotedType.replace("Message", "")
            );

            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            return { buffer, type: quotedType };

        }

    }

    return null;

}

module.exports = {
    name: "sticker",
    aliases: ["s", "stiker"],
    category: "Media",
    desc: "Convert an image into a WhatsApp sticker",
    usage: "Send an image with caption .sticker, or reply to an image with .sticker",
    cooldown: 5,

    async execute(sock, m, args) {

        const media = await getMediaBuffer(m);

        if (!media) {
            await m.reply("📸 Send an image with the caption *.sticker*, or reply to an image with *.sticker*.");
            return;
        }

        if (media.type === "videoMessage") {
            await m.reply("🎥 Animated/video stickers aren't supported yet — please use a static image.");
            return;
        }

        await m.react("⏳");

        try {

            const webpBuffer = await sharp(media.buffer)
                .resize(512, 512, {
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 80 })
                .toBuffer();

            await sock.sendMessage(
                m.chat,
                { sticker: webpBuffer },
                { quoted: m }
            );

            await m.react("✅");

        } catch (err) {

            console.error(err);
            await m.reply("⚠️ Failed to create sticker. Make sure you sent a valid image file.");

        }

    }
};
      
