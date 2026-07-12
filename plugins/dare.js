const dares = [
    "Send the last photo in your gallery to this chat.",
    "Text your crush 'I have something to tell you' and share their reply.",
    "Speak in an accent for the next 3 messages.",
    "Change your profile picture to something silly for 1 hour.",
    "Send a voice note singing your favorite song.",
    "Message the 5th contact in your phone and ask them how their day is.",
    "Post a status saying 'I love Mondays' and screenshot the reactions.",
    "Reply to every message with an emoji for the next 10 minutes.",
    "Do 10 pushups right now and admit it here.",
    "Tell the group your most-used emoji and why."
];

module.exports = {
    name: "dare",
    category: "Fun",
    description: "Get a random dare.",
    usage: ".dare",

    async execute(sock, m) {
        const d = dares[Math.floor(Math.random() * dares.length)];
        await m.reply(`🔥 *Dare:*\n${d}`);
    }
};
