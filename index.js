//==================================================
// Kenya-Ultra WhatsApp Bot
// Developed by Lucid Tech Solutions
//==================================================

// Auto Install Dependencies
require("./install");

// Environment Variables
require("dotenv").config();

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

//==================================================
// Start Bot
//==================================================

async function startBot() {
        logger.line();
    logger.bot("Starting Kenya-Ultra...");
    logger.line();

    //==================================================
    // Authentication
    //==================================================

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(SESSION_DIR);

    //==================================================
    // Latest Baileys Version
    //==================================================

    const {
        version
    } = await fetchLatestBaileysVersion();
    
  
    //==================================================
    // Create WhatsApp Socket
    //==================================================

    sock = makeWASocket({

        version,

        auth: state,

        browser: Browsers.macOS("Kenya-Ultra"),

        logger: P({
            level: "silent"
        }),

        printQRInTerminal: true,

        syncFullHistory: false,

        markOnlineOnConnect: true,

        generateHighQualityLinkPreview: true

    });

    //==================================================
    // Bind Store
    //==================================================

    if (store?.bind) {
        store.bind(sock.ev);
    }

    //==================================================
    // Save Credentials
    //==================================================

    sock.ev.on("creds.update", saveCreds);
        //==================================================
// Advanced Connection Manager
//==================================================

sock.ev.on("connection.update", async (update) => {

    const {
        connection,
        lastDisconnect,
        qr
    } = update;
    const reason = lastDisconnect?.error?.output?.statusCode;

    //--------------------------------------------------
    // QR Code Generated
    //--------------------------------------------------
    
    if (qr) {
        logger.info("📱 QR Code generated! Scan it with WhatsApp on your phone.");
        logger.info("WhatsApp → Linked Devices → Link a Device");
    }

    //--------------------------------------------------
// Connecting
//--------------------------------------------------

if (connection === "connecting") {

    logger.info("Connecting to WhatsApp...");

}

    //--------------------------------------------------
    // Closed / Disconnected
    //--------------------------------------------------

    if (connection === "close") {

        logger.error(
            `Connection closed. Reason: ${reason || "unknown"} (${DisconnectReason[reason] || "no matching DisconnectReason"})`
        );

        if (lastDisconnect?.error) {
            console.error(lastDisconnect.error);
        }

    }
               
    //--------------------------------------------------
    // Connected
    //--------------------------------------------------

    if (connection === "open") {

        reconnecting = false;

        logger.success("Connected Successfully!");

        logger.info(
            `Bot : ${sock.user?.name || "Unknown"}`
        );

        logger.info(
            `Number : ${sock.user?.id.split(":")[0]}`
        );

        logger.line();

        return;

    }

               //--------------------------------------------------
            // Smart Reconnect
            //--------------------------------------------------

            if (reason === DisconnectReason.loggedOut) {

                logger.error(
                    "Session logged out by WhatsApp. Delete the /session folder and restart to re-pair."
                );

                process.exit(1);

            } else {

                if (reconnecting) return;

                reconnecting = true;

                if (reconnectTimer) {
                    clearTimeout(reconnectTimer);
                }

                logger.warn("Reconnect disabled while debugging.");

            }        
});

        //==================================================
    // Incoming Messages
    //==================================================

    sock.ev.on("messages.upsert", async ({ messages, type }) => {

        try {

            if (type !== "notify") return;

            const msg = messages[0];

            if (!msg?.message) return;

            if (msg.key?.remoteJid === "status@broadcast") return;

            // Serialize Message
            const m = await serialize(sock, msg);

            // Handle Commands
            await commandHandler(sock, m);

        } catch (err) {

            logger.error("Message Handler Error");

            console.error(err);

        }

    });

    //==================================================
    // Return Socket
    //==================================================

    return sock;

}
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
// Start Kenya-Ultra
//==================================================

startBot()
    .then(() => {

        logger.success("Kenya-Ultra Started Successfully.");

    })
    .catch((err) => {

        logger.error("Failed to Start Kenya-Ultra.");

        console.error(err);

        process.exit(1);

    });
            
