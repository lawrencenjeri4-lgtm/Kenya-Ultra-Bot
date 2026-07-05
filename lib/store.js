const makeInMemoryStore = require("@whiskeysockets/baileys").makeInMemoryStore;
const P = require("pino");

const store = makeInMemoryStore({

    logger: P({
        level: "silent"
    })

});

module.exports = store;
