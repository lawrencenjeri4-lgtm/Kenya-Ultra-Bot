//==================================================
// BLOCK 1/10
// Kenya-Ultra WhatsApp Bot
// Developed by Lucid Tech Solutions
// GitHub: https://github.com/lawrencenjeri4-lgtm/Kenya-Ultra-Bot
//==================================================

//==================================================
// Auto Installer
//==================================================

require("./install");

//==================================================
// Environment Variables
//==================================================

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

const P = require("pino");
const fs = require("fs");
const path = require("path");

//==================================================
// Kenya-Ultra Libraries
//==================================================

const logger = require("./lib/logger");
const store = require("./lib/store");
const serialize = require("./lib/serialize");

//==================================================
// Handlers
//==================================================

const commandHandler = require("./handlers/commandHandler");
const { loadPlugins } = require("./handlers/pluginLoader");

//==================================================
// BLOCK 2/10
// Global Variables & Session Manager
//==================================================

// Load Plugins
loadPlugins();

//==================================================
// Session Folder
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

// Current WhatsApp Socket
let sock = null;

// Prevent duplicate pairing requests
let pairingRequested = false;

// Prevent reconnect spam
let reconnectTimer = null;

// Track if bot is already reconnecting
let reconnecting = false;

//==================================================
// Start Kenya-Ultra
//==================================================

async function startBot() {

    logger.line();
    logger.bot("Starting Kenya-Ultra...");
    logger.line();

    //==============================================
    // Authentication State
    //==============================================

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(SESSION_DIR);

    //==============================================
    // Latest Baileys Version
    //==============================================

    const {
        version
    } = await fetchLatestBaileysVersion();

//==================================================
// BLOCK 3/10
// Create WhatsApp Socket
//==================================================

    sock = makeWASocket({

        version,

        browser: Browsers.macOS("Kenya-Ultra"),

        auth: state,

        logger: P({
            level: "silent"
        }),

        syncFullHistory: false,

        printQRInTerminal: false,

        markOnlineOnConnect: true,

        generateHighQualityLinkPreview: true,

        fireInitQueries: true,

        emitOwnEvents: false

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
// BLOCK 4/10
// Connection Manager
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
        // Open
        //--------------------------------------------------

        if (connection === "open") {

            reconnecting = false;
            pairingRequested = false;

            logger.success("Kenya-Ultra Connected Successfully!");

            if (sock.user) {

                logger.info(
                    `Logged in as: ${sock.user.name || "Unknown"}`
                );

                logger.info(
                    `Bot Number: ${sock.user.id.split(":")[0]}`
                );

            }

            logger.line();

            return;

        }

        //--------------------------------------------------
        // Generate Pairing Code
        //--------------------------------------------------

        if (
            connection === "connecting" &&
            process.env.PAIRING_NUMBER &&
            !state.creds.registered &&
            !pairingRequested
        ) {

            pairingRequested = true;

            try {

                logger.info("Generating Pairing Code...");

                const code =
                    await sock.requestPairingCode(
                        process.env.PAIRING_NUMBER.trim()
                    );

                logger.line();

                logger.success(
                    `PAIRING CODE : ${code}`
                );

                logger.line();

                logger.info(
                    "WhatsApp > Linked Devices > Link with Phone Number"
                );

            } catch (err) {

                pairingRequested = false;

                logger.error("Failed to generate pairing code.");

                console.error(err);

            }

        }

        //--------------------------------------------------
        // Connection Closed
        //--------------------------------------------------

        if (connection === "close") {

            const reason =
                lastDisconnect?.error?.output?.statusCode;

            logger.warn(
                `Connection Closed (${reason})`
            );

            if (reason === DisconnectReason.loggedOut) {

                logger.error("Session Logged Out.");

                logger.error(
                    "Delete the session folder and pair again."
                );

                process.exit(0);

            }

            if (reconnecting) return;

            reconnecting = true;

            if (reconnectTimer)
                clearTimeout(reconnectTimer);

            reconnectTimer = setTimeout(() => {

                logger.info("Reconnecting...");

                reconnecting = false;

                startBot();

            }, 5000);

        }

    });

    //==================================================
// BLOCK 5/10
// Message Handler
//==================================================

    sock.ev.on("messages.upsert", async ({ messages, type }) => {

        try {

            if (type !== "notify") return;

            const msg = messages[0];

            if (!msg?.message) return;

            if (msg.key?.remoteJid === "status@broadcast") return;

            // Serialize message
            const m = await serialize(sock, msg);

            // Execute commands
            await commandHandler(sock, m);

        } catch (err) {

            logger.error("Message Handler Error");

            console.error(err);

        }

    });

    //==================================================
    // Process Error Handlers
    //==================================================

    process.removeAllListeners("uncaughtException");
    process.removeAllListeners("unhandledRejection");

    process.on("uncaughtException", (err) => {

        logger.error("Uncaught Exception");

        console.error(err);

    });

    process.on("unhandledRejection", (reason) => {

        logger.error("Unhandled Promise Rejection");

        console.error(reason);

    });

    return sock;

}

//==================================================
// BLOCK 6/10
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
            sock.end();
        }

    } catch (err) {
        console.error(err);
    }

    process.exit(0);

});

//==================================================
// BLOCK 7/10
// Start Kenya-Ultra
//==================================================

startBot()
    .then(() => {

        logger.success("Kenya-Ultra is now running.");

    })
    .catch((err) => {

        logger.error("Failed to start Kenya-Ultra.");

        console.error(err);

        process.exit(1);

    });

//==================================================
// END OF FILE
//==================================================

