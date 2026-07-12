const sharp = require("sharp");

module.exports = {
    name: "toimg",
    aliases: ["toimage"],
    category: "Media",
    description: "Convert a quoted sticker into an image.",
    usage: "Reply to a sticker with .toimg",
    cooldown: 5,

    async execute(sock, m) {

        if (!m.quoted || m.quoted.type !== "stickerMessage") {
            return m.reply("🖼️ Reply to a sticker with *.toimg* to convert it to an image.");
        }

        await m.react("⏳");

        try {
            const buffer = await m.quoted.download();
            const png = await sharp(buffer).png().toBuffer();

            await sock.sendMessage(m.chat, { image: png }, { quoted: m.msg });
            await m.react("✅");
        } catch (err) {
            console.error(err);
            await m.reply("⚠️ Failed to convert that sticker.");
        }
    }
};
