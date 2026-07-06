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
        lastQRCode = qr;
        
        logger.line();
        logger.info("📱 QR CODE GENERATED!");
        logger.line();
        
        // Generate QR code image and save it
        try {
            await QRCode.toFile(
                path.join(__dirname, "qr.png"),
                qr,
                {
                    errorCorrectionLevel: 'H',
                    type: 'image/png',
                    quality: 0.95,
                    margin: 1,
                    width: 300
                }
            );
            logger.success("✅ QR code saved to: ./qr.png");
        } catch (err) {
            logger.error("Failed to save QR code image");
            console.error(err);
        }

        logger.info("📲 SCAN OPTIONS:");
        logger.info("1. Terminal: Look for the QR code grid above ↑");
        logger.info("2. File: Check the qr.png file in your project root");
        logger.line();
        logger.info("📱 On your phone:");
        logger.info("   Settings → Linked Devices → Link a Device");
        logger.line();
    }

    //--------------------------------------------------
// Connecting
//--------------------------------------------------

if (connection === "connecting") {

    logger.info("Connecting to WhatsApp...");

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

            await new Promise(resolve => setTimeout(resolve, 2000));

            logger.info("Generating Pairing Code...");

            const code = await sock.requestPairingCode(
                process.env.PAIRING_NUMBER.trim()
            );

            logger.line();
            logger.success(`✅ PAIRING CODE: ${code}`);
            logger.line();
            logger.info("📱 Alternative method (if QR doesn't work):");
            logger.info("1. Open WhatsApp on your phone");
            logger.info("2. Go to Settings → Linked Devices → Link with Phone Number");
            logger.info("3. Enter this code when prompted");
            logger.info("⏱️  Code expires in 60 seconds");
            logger.line();

        } catch (err) {

            pairingRequested = false;

            logger.error("❌ Failed to generate pairing code.");
            logger.error(`Error details: ${err.message}`);
            console.error(err);

        }

    }

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
        pairingRequested = false;

        logger.success("✅ Connected Successfully!");

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
// API Route - Get Current QR Code (for website)
//==================================================

function getQRCode() {
    return lastQRCode;
}

// Export for use in a web server
module.exports = { startBot, getQRCode };

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
            
