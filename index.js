//==================================================
// Kenya-Ultra WhatsApp Bot
// Developed by Lucid Tech Solutions
//==================================================

// Auto Install Dependencies
require("./install");

// Environment Variables
require("dotenv").config();

//==================================================
// Express Server Setup
//==================================================

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

//==================================================
// Baileys
//==================================================

const {
    default: makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    Browsers
} = require("@whiskeysockets/baileys");

//==================================================
// Node Modules
//==================================================

const fs = require("fs");
const path = require("path");
const P = require("pino");
const QRCode = require("qrcode");

//==================================================
// Internal Modules
//==================================================

const logger = require("./lib/logger");
const store = require("./lib/store");
const serialize = require("./lib/serialize");

const commandHandler = require("./handlers/commandHandler");
const { loadPlugins } = require("./handlers/pluginLoader");

//==================================================
// Load Plugins
//==================================================

loadPlugins();

//==================================================
// Session Directory
//==================================================

const SESSION_DIR = path.join(__dirname, "session");

if (!fs.existsSync(SESSION_DIR)) {

    fs.mkdirSync(SESSION_DIR, {
        recursive: true
    });

}

//==================================================
// Global Variables
//==================================================

let sock = null;

let reconnecting = false;

let reconnectTimer = null;

let pairingRequested = false;

let lastQRCode = null;

let botStatus = "initializing";

let botInfo = {
    name: "Unknown",
    number: "Unknown",
    connected: false
};

//==================================================
// Start Bot
//==================================================

async function startBot() {

    logger.line();
    logger.bot("Starting Kenya-Ultra...");
    logger.line();

    pairingRequested = false;

    const { state, saveCreds } =
        await useMultiFileAuthState(SESSION_DIR);

    const { version } =
        await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        browser: Browsers.ubuntu("Chrome"),
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true
    });

    //--------------------------------------------------
    // Save Credentials
    //--------------------------------------------------

    sock.ev.on("creds.update", saveCreds);

    //--------------------------------------------------
    // Bind Store
    //--------------------------------------------------

    if (store?.bind) {

        store.bind(sock.ev);

    }

    //==================================================
// Connection Manager
//==================================================

sock.ev.on("connection.update", async (update) => {

    const { connection, lastDisconnect, qr } = update;

    const reason = lastDisconnect?.error?.output?.statusCode;

    //--------------------------------------------------
    // QR RECEIVED
    //--------------------------------------------------

    if (qr) {

        lastQRCode = qr;

        botStatus = "qr_generated";

        logger.line();
        logger.info("QR Code Generated");
        logger.line();

        try {

            await QRCode.toFile(
                path.join(__dirname, "qr.png"),
                qr
            );

        } catch (e) {

            console.error(e);

        }

    }

    //--------------------------------------------------
    // CONNECTING
    //--------------------------------------------------

    if (connection === "connecting") {

        botStatus = "connecting";

        logger.info("Connecting to WhatsApp...");

    }

    //--------------------------------------------------
    // OPEN
    //--------------------------------------------------

    if (connection === "open") {

        botStatus = "connected";

        reconnecting = false;

        pairingRequested = false;

        botInfo = {

            name: sock.user?.name || "Unknown",

            number: sock.user?.id?.split(":")[0] || "Unknown",

            connected: true

        };

        logger.success("Connected Successfully!");

        logger.info(`Bot : ${botInfo.name}`);

        logger.info(`Number : ${botInfo.number}`);

        logger.line();

        return;

    }

    //--------------------------------------------------
    // REQUEST PAIRING CODE
    //--------------------------------------------------

    if (
        process.env.PAIRING_NUMBER &&
        !state.creds.registered &&
        !pairingRequested
    ) {

        pairingRequested = true;

        try {

            await new Promise(r => setTimeout(r, 4000));

            const code = await sock.requestPairingCode(

                process.env.PAIRING_NUMBER.trim()

            );

            logger.line();

            logger.success(`PAIR CODE : ${code}`);

            logger.line();

            logger.info("Linked Devices → Link with Phone Number");

        } catch (err) {

            pairingRequested = false;

            logger.error("Failed to generate Pair Code");

            console.error(err);

        }

    }

    //--------------------------------------------------
    // CLOSE
    //--------------------------------------------------

    if (connection === "close") {

        logger.warn(`Disconnected (${reason})`);

        if (reason === DisconnectReason.loggedOut) {

            logger.error("Logged out.");

            return;

        }

        logger.info("Restarting socket...");

        setTimeout(() => {

            startBot();

        }, 2000);

    }

});

         //==================================================
    // Incoming Messages
    //==================================================

    sock.ev.on("messages.upsert", async ({ messages, type }) => {

    try {

        console.log("EVENT:", type);

        if (type !== "notify") return;

        const msg = messages[0];

        console.log("RAW:", JSON.stringify(msg, null, 2));

        if (!msg?.message) return;

        if (msg.key?.remoteJid === "status@broadcast") return;

        if (msg.message?.protocolMessage) return;
        
       const m = await serialize(sock, msg);

if (!m) return;

await commandHandler(sock, m); 

    } catch (err) {

        console.error(err);

    }

});

    //==================================================
    // Return Socket
    //==================================================

    return sock;

}

//==================================================
// API ROUTES
//==================================================

//==================================================
// GET QR IMAGE
//==================================================

app.get("/api/qr-code", async (req, res) => {

    try { 

        if (!lastQRCode) {

            return res.status(404).send("QR Code not available.");

        }

        const buffer = await QRCode.toBuffer(lastQRCode, {

            errorCorrectionLevel: "H",
            margin: 1,
            width: 350

        });

        res.setHeader("Content-Type", "image/png");

        res.send(buffer);

    } catch (err) {

        console.error(err);

        res.status(500).send("Failed to generate QR.");

    }

});

/**
 * GET /api/status
 * Returns bot connection status
 */
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        status: botStatus,
        bot: botInfo,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Bot API is running",
        timestamp: new Date().toISOString()
    });
});

//==================================================
// Global Error Handlers
//==================================================

process.on("uncaughtException", (err) => {

    logger.error("Uncaught Exception");

    console.error(err);

});

process.on("unhandledRejection", (reason) => {

    logger.error("Unhandled Promise Rejection");

    console.error(reason);

});
//==================================================
// Graceful Shutdown
//==================================================

process.on("SIGINT", () => {

    logger.warn("Stopping Kenya-Ultra...");

    try {

        if (sock) {
            sock.end();
        }

    } catch (err) {
        console.error(err);
    }

    process.exit(0);

});

process.on("SIGTERM", () => {

    logger.warn("Stopping Kenya-Ultra...");

    try {

        if (sock) {
            sock.ws?.close();
        }

    } catch (err) {
        console.error(err);
    }

    process.exit(0);

});

//==================================================
// Start Bot & Express Server
//==================================================

const PORT = process.env.PORT || 3000;

startBot()
    .then(() => {

        logger.success("Kenya-Ultra Started Successfully.");

        // Start Express server
        app.listen(PORT, () => {
            logger.line();
            logger.success(`🚀 Express Server running on port ${PORT}`);
            logger.info(`📱 QR Code API: http://localhost:${PORT}/api/qr-code`);
            logger.info(`🤖 Status API: http://localhost:${PORT}/api/status`);
            logger.info(`❤️  Health Check: http://localhost:${PORT}/api/health`);
            logger.line();
        });

    })
    .catch((err) => {

        logger.error("Failed to Start Kenya-Ultra.");

        console.error(err);

        process.exit(1);

    });

module.exports = { app, startBot };
