//==================================================
// Kenya-Ultra WhatsApp Bot - Test Version
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
const qrcode = require("qrcode-terminal");

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

//==================================================
// Start Bot - Simplified Version
//==================================================

async function startBot() {
    
    console.log("=".repeat(50));
    console.log("Starting Kenya-Ultra Bot...");
    console.log("=".repeat(50));

    try {
        
        // Authentication
        console.log("[1/4] Loading authentication state...");
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState(SESSION_DIR);

        // Latest Baileys Version
        console.log("[2/4] Fetching latest Baileys version...");
        const {
            version
        } = await fetchLatestBaileysVersion();
        
        console.log(`[3/4] Creating WhatsApp socket...`);
        console.log(`      Version: ${version.join(".")}`);
        
        // Create WhatsApp Socket
        sock = makeWASocket({
            version,
            auth: state,
            browser: Browsers.macOS("Kenya-Ultra"),
            logger: P({
                level: "silent"
            }),
            printQRInTerminal: false, // We'll handle this manually
            syncFullHistory: false,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true
        });

        // Save Credentials
        sock.ev.on("creds.update", saveCreds);

        // QR Code Handler
        sock.ev.on("connection.update", async (update) => {
            const {
                connection,
                lastDisconnect,
                qr
            } = update;

            // Show QR Code
            if (qr) {
                console.log("\n");
                console.log("=".repeat(50));
                console.log("🔐 SCAN THIS QR CODE WITH YOUR PHONE");
                console.log("=".repeat(50));
                qrcode.generate(qr, {
                    small: true
                });
                console.log("=".repeat(50));
                console.log("WhatsApp → Linked Devices → Link with Phone Number");
                console.log("=".repeat(50));
                console.log("\n");
            }

            // Connecting
            if (connection === "connecting") {
                console.log("📡 Connecting to WhatsApp...");
            }

            // Connected
            if (connection === "open") {
                console.log("✅ Connected Successfully!");
                console.log(`Bot: ${sock.user?.name || "Unknown"}`);
                console.log(`Number: ${sock.user?.id.split(":")[0]}`);
                console.log("=".repeat(50));
                return;
            }

            // Disconnected
            if (connection === "close") {
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log(`❌ Connection closed (${reason || "unknown"})`);

                if (reason === DisconnectReason.loggedOut) {
                    console.log("⚠️  Session logged out. Delete /session folder and restart.");
                    process.exit(1);
                }
            }
        });

        // Incoming Messages Handler
        sock.ev.on("messages.upsert", async ({ messages, type }) => {
            if (type !== "notify") return;
            const msg = messages[0];
            if (!msg?.message) return;
            console.log(`📨 Message received: ${msg.pushName || "Unknown"}`);
        });

        console.log("[4/4] Waiting for QR code...\n");

    } catch (err) {
        console.error("❌ Error starting bot:");
        console.error(err);
        process.exit(1);
    }

    return sock;
}

//==================================================
// Error Handlers
//==================================================

process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
});

//==================================================
// Graceful Shutdown
//==================================================

process.on("SIGINT", () => {
    console.log("\n🛑 Stopping Kenya-Ultra...");
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
// Start Bot
//==================================================

startBot()
    .catch((err) => {
        console.error("Failed to start:", err);
        process.exit(1);
    });
