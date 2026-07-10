module.exports = {
    bot: {
        name: "Kenya-Ultra",
        version: "1.0.0",
        prefix: "."
    },

    owner: {
        name: "Lucid Dev",
        number: process.env.OWNER_NUMBER || "254700000000"
    },

    settings: {
        mode: "private", // public | private | self | group
        autoRead: false,
        autoTyping: false,
        autoRecording: false,
        autoReact: false
    }
};
