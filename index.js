// ============================================
// Kenya-Ultra WhatsApp Bot
// Developed by Lucid Tech Solutions
// GitHub: https://github.com/lawrencenjeri4-lgtm/Kenya-Ultra-Bot
// ============================================

// Auto install dependencies
require("./install");

// Environment variables
require("dotenv").config();

const {
    default: makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    Browsers
} = require("@whiskeysockets/baileys");

const P = require("pino");
const fs = require("fs");
const path = require("path");

const logger = require("./lib/logger");
const store = require("./lib/store");
const serialize = require("./lib/serialize");

const commandHandler = require("./handlers/commandHandler");
const { loadPlugins } = require("./handlers/pluginLoader");

// Load plugins
loadPlugins();

// Session folder
const SESSION_DIR = path.join(__dirname, "session");

if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, {
        recursive: true
    });
}

// =========================
// Start Bot
// =========================

async function startBot() {

    logger.line();
    logger.bot("Starting Kenya-Ultra...");
    logger.line();

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(SESSION_DIR);

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({

        version,

        browser: Browsers.macOS("Kenya-Ultra"),

        logger: P({
            level: "silent"
        }),

        auth: state,

        syncFullHistory: false,

        printQRInTerminal: false,

        markOnlineOnConnect: true,

        generateHighQualityLinkPreview: true

    });

    // Bind message store
    if (store?.bind) {
        store.bind(sock.ev);
    }
        // =========================
    // Connection Updates
    // =========================

    sock.ev.on("connection.update", async (update) => {

        const {
            connection,
            lastDisconnect
        } = update;

        if (connection === "connecting") {
            logger.info("Connecting to WhatsApp...");
        }

        if (connection === "open") {

            logger.success("Kenya-Ultra Connected Successfully!");

            if (sock.user) {
                logger.info(`Logged in as: ${sock.user.name || "Unknown"}`);
                logger.info(`Bot Number: ${sock.user.id.split(":")[0]}`);
            }

            logger.line();
        }

        if (connection === "close") {

            const statusCode =
                lastDisconnect?.error?.output?.statusCode;

            if (statusCode === DisconnectReason.loggedOut) {

                logger.error("Session logged out.");
                logger.error("Delete the session folder and pair again.");

                process.exit(0);

            } else {

                logger.warn("Connection lost. Reconnecting...");

                startBot();

            }

        }

    });

    // =========================
    // Save Credentials
    // =========================

    sock.ev.on("creds.update", saveCreds);

    // =========================
    // Pairing Code (Future Web Pair)
    // =========================

    if (
        process.env.PAIRING_NUMBER &&
        !state.creds.registered
    ) {

        try {

            const code = await sock.requestPairingCode(
                process.env.PAIRING_NUMBER
            );

            logger.line();
            logger.info(`Pairing Code: ${code}`);
            logger.line();

        } catch (err) {

            logger.error("Failed to generate pairing code.");
            console.log(err);

        }

    }
        // =========================
    // Incoming Messages
    // =========================

    sock.ev.on("messages.upsert", async ({ messages, type }) => {

        try {

            if (type !== "notify") return;

            let msg = messages[0];

            if (!msg.message) return;

            if (msg.key && msg.key.remoteJid === "status@broadcast") return;

            // Serialize message
            const m = await serialize(sock, msg);

            // Handle commands
            await commandHandler(sock, m);

        } catch (err) {

            logger.error("Message Handler Error");
            console.error(err);

        }

    });

    // =========================
    // Process Error Handlers
    // =========================

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

// =========================
// Start Kenya-Ultra
// =========================

startBot().catch(err => {
    logger.error("Failed to start Kenya-Ultra");
    console.error(err);
});
                  
