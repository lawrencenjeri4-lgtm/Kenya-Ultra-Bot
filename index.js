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

let pairingRequested = false;

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
    // Socket Factory
    //==================================================

    sock = makeWASocket({

        version,

        auth: state,

        browser: Browsers.macOS("Kenya-Ultra"),

        logger: P({
            level: "silent"
        }),

        printQRInTerminal: false,

        syncFullHistory: false,

        markOnlineOnConnect: true,

        generateHighQualityLinkPreview: true,

        connectTimeoutMs: 60000,

        defaultQueryTimeoutMs: 60000,

        keepAliveIntervalMs: 30000

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
    // Create WhatsApp Socket
    //==================================================

    sock = makeWASocket({

        version,

        auth: state,

        browser: Browsers.macOS("Kenya-Ultra"),

        logger: P({
            level: "silent"
        }),

        printQRInTerminal: false,

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
        lastDisconnect
    } = update;

    //--------------------------------------------------
    // Connecting
    //--------------------------------------------------

    if (connection === "connecting") {

        logger.info("Connecting to WhatsApp...");

    }
            //--------------------------------------------------
        // Pairing Manager
        //--------------------------------------------------

        if (
            process.env.PAIRING_NUMBER &&
            !state.creds.registered &&
            !pairingRequested
        ) {

            pairingRequested = true;

            try {

                // Wait a moment before requesting the pairing code
                await new Promise(resolve => setTimeout(resolve, 3000));

                logger.info("Generating Pairing Code...");

                const code = await sock.requestPairingCode(
                    process.env.PAIRING_NUMBER.trim()
                );

                logger.line();

                logger.success(`PAIRING CODE : ${code}`);

                logger.line();

                logger.info(
                    "WhatsApp → Linked Devices → Link with Phone Number"
                );

            } catch (err) {

                pairingRequested = false;

                logger.error("Failed to generate pairing code.");

                console.error(err);

            }

        }

    
    //--------------------------------------------------
    // Connected
    //--------------------------------------------------

    if (connection === "open") {

        reconnecting = false;
        pairingRequested = false;

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

            if (reason !== DisconnectReason.loggedOut) {

                if (reconnecting) return;

                reconnecting = true;

                if (reconnectTimer) {
                    clearTimeout(reconnectTimer);
                }

                reconnectTimer = setTimeout(async () => {

                    try {

                        logger.info("Restarting Kenya-Ultra...");

                        if (sock?.ws) {
                            sock.ws.close();
                        }

                    } catch (e) {}

                    reconnecting = false;

                    startBot();

                }, 5000);

            }        


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
