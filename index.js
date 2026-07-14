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
    fs.mkdirSync(SESSION_DIR, { recursive: true });
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

// Track the most recent pairing request from the website
let pendingPair = null; // { session_id, phone, requested_at }

//==================================================
// Start Bot
//==================================================

async function startBot() {

    logger.line();
    logger.bot("Starting Kenya-Ultra...");
    logger.line();

    pairingRequested = false;

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

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

    sock.ev.on("creds.update", saveCreds);

    if (store?.bind) store.bind(sock.ev);

    //==================================================
    // Connection Manager
    //==================================================

    sock.ev.on("connection.update", async (update) => {

        const { connection, lastDisconnect, qr } = update;
        const reason = lastDisconnect?.error?.output?.statusCode;

        if (qr) {
            lastQRCode = qr;
            botStatus = "qr_generated";
            logger.line();
            logger.info("QR Code Generated");
            logger.line();
            try {
                await QRCode.toFile(path.join(__dirname, "qr.png"), qr);
            } catch (e) { console.error(e); }
        }

        if (connection === "connecting") {
            botStatus = "connecting";
            logger.info("Connecting to WhatsApp...");
        }

        if (connection === "open") {
            botStatus = "connected";
            reconnecting = false;
            pairingRequested = false;
            pendingPair = null;
            botInfo = {
                name: sock.user?.name || "Unknown",
                number: sock.user?.id?.split(":")[0] || "Unknown",
                connected: true
            };
            logger.success("Connected Successfully!");
            logger.info(`Bot   : ${botInfo.name}`);
            logger.info(`Number: ${botInfo.number}`);
            logger.line();
            return;
        }

        // Optional env-based pairing (unchanged)
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
            } catch (err) {
                pairingRequested = false;
                logger.error("Failed to generate Pair Code");
                console.error(err);
            }
        }

        if (connection === "close") {
            logger.warn(`Disconnected (${reason})`);
            if (reason === DisconnectReason.loggedOut) {
                logger.error("Logged out.");
                botStatus = "logged_out";
                botInfo.connected = false;
                return;
            }
            logger.info("Restarting socket...");
            setTimeout(() => startBot(), 2000);
        }
    });

    //==================================================
    // Incoming Messages
    //==================================================

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        try {
            const msg = messages[0];
            if (type !== "notify") return;
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

    return sock;
}

//==================================================
// Website API auth
//==================================================

function requireApiKey(req, res, next) {
    const expected = process.env.WEB_API_KEY;
    if (!expected) {
        return res.status(500).json({ error: "WEB_API_KEY is not set on the bot" });
    }
    const provided = req.get("x-api-key");
    if (provided !== expected) {
        return res.status(401).json({ error: "Invalid or missing x-api-key" });
    }
    next();
}

//==================================================
// PUBLIC API ROUTES (existing)
//==================================================

app.get("/api/qr-code", async (req, res) => {
    try {
        if (!lastQRCode) return res.status(404).send("QR Code not available.");
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

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        status: botStatus,
        bot: botInfo,
        timestamp: new Date().toISOString()
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Bot API is running",
        timestamp: new Date().toISOString()
    });
});

//==================================================
// WEBSITE PAIRING API (called by kenya-ultra.lovable.app)
//   Auth: header `x-api-key: <WEB_API_KEY>`
//==================================================

/**
 * POST /pair  { phone: "2547XXXXXXXX" }
 * Returns a fresh 8-char pairing code for that phone number.
 */
app.post("/pair", requireApiKey, async (req, res) => {
    try {
        const phone = String(req.body?.phone || "").replace(/\D/g, "");
        if (phone.length < 8) {
            return res.status(400).json({ error: "Invalid phone number" });
        }
        if (!sock) {
            return res.status(503).json({ error: "Bot socket not ready" });
        }
        if (botStatus === "connected") {
            return res.status(409).json({
                error: "Bot is already paired. Disconnect first to re-pair."
            });
        }

        // Baileys occasionally needs a moment after socket creation
        await new Promise(r => setTimeout(r, 1500));

        const code = await sock.requestPairingCode(phone);
        const session_id = `pair_${Date.now()}`;
        pendingPair = { session_id, phone, requested_at: Date.now() };

        logger.success(`Web pairing code for ${phone}: ${code}`);

        return res.json({
            code,
            session_id,
            phone,
            expires_in: 60
        });
    } catch (err) {
        console.error("POST /pair failed:", err);
        return res.status(500).json({ error: err?.message || "Pairing failed" });
    }
});

/**
 * POST /qr
 * Returns the most recent QR as a data URL.
 */
app.post("/qr", requireApiKey, async (req, res) => {
    try {
        if (!lastQRCode) {
            return res.status(404).json({
                error: "No QR available yet. Wait a few seconds and retry."
            });
        }
        const dataUrl = await QRCode.toDataURL(lastQRCode, {
            errorCorrectionLevel: "H",
            margin: 1,
            width: 350
        });
        const session_id = `qr_${Date.now()}`;
        return res.json({
            qr: dataUrl,
            session_id,
            expires_in: 60
        });
    } catch (err) {
        console.error("POST /qr failed:", err);
        return res.status(500).json({ error: err?.message || "QR generation failed" });
    }
});

/**
 * GET /sessions
 * Returns the active bot session (single-account bot).
 */
app.get("/sessions", requireApiKey, (req, res) => {
    const sessions = [];
    if (botInfo.connected) {
        sessions.push({
            session_id: botInfo.number,
            phone: botInfo.number,
            status: "connected",
            last_seen: new Date().toISOString()
        });
    } else if (pendingPair) {
        sessions.push({
            session_id: pendingPair.session_id,
            phone: pendingPair.phone,
            status: botStatus,
            last_seen: new Date(pendingPair.requested_at).toISOString()
        });
    }
    return res.json({ sessions });
});

/**
 * DELETE /sessions/:id
 * Logs out the bot and clears the local auth state.
 */
app.delete("/sessions/:id", requireApiKey, async (req, res) => {
    try {
        if (sock) {
            try { await sock.logout(); } catch (_) {}
            try { sock.end?.(); } catch (_) {}
        }
        // Wipe stored auth so next start goes back to pairing
        try {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
            fs.mkdirSync(SESSION_DIR, { recursive: true });
        } catch (e) { console.error("Failed to clear session dir:", e); }

        botInfo = { name: "Unknown", number: "Unknown", connected: false };
        botStatus = "disconnected";
        pendingPair = null;
        lastQRCode = null;

        // Restart so a fresh pairing/QR flow becomes available
        setTimeout(() => startBot().catch(console.error), 1000);

        return res.json({ ok: true });
    } catch (err) {
        console.error("DELETE /sessions failed:", err);
        return res.status(500).json({ error: err?.message || "Disconnect failed" });
    }
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
    try { if (sock) sock.end(); } catch (err) { console.error(err); }
    process.exit(0);
});

process.on("SIGTERM", () => {
    logger.warn("Stopping Kenya-Ultra...");
    try { if (sock) sock.ws?.close(); } catch (err) { console.error(err); }
    process.exit(0);
});

//==================================================
// Start Bot & Express Server
//==================================================

const PORT = process.env.PORT || 10000;
const PUBLIC_URL = process.env.PUBLIC_URL || "https://kenya-ultra-bot.onrender.com";

startBot()
    .then(() => {
        logger.success("Kenya-Ultra Started Successfully.");

        app.listen(PORT, () => {
            logger.line();
            logger.success(`🚀 Express Server running on port ${PORT}`);
            logger.info(`❤️  Health : ${PUBLIC_URL}/api/health`);
            logger.info(`🤖 Status : ${PUBLIC_URL}/api/status`);
            logger.info(`📱 QR PNG : ${PUBLIC_URL}/api/qr-code`);
            logger.info(`🔗 Pair   : POST ${PUBLIC_URL}/pair   (x-api-key)`);
            logger.info(`🔗 QR JSON: POST ${PUBLIC_URL}/qr     (x-api-key)`);
            logger.info(`🔗 List   : GET  ${PUBLIC_URL}/sessions (x-api-key)`);
            logger.line();
        });
    })
    .catch((err) => {
        logger.error("Failed to Start Kenya-Ultra.");
        console.error(err);
        process.exit(1);
    });

module.exports = { app, startBot };
           
