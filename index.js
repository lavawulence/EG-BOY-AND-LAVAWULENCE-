import makeWASocket, {
  useMultiFileAuthState
} from "@whiskeysockets/baileys";

import pino from "pino";

import {
  BOT_NAME,
  PHONE_NUMBER
} from "./config.js";

import { MENU } from "./commands/menu.js";

async function startBot() {

  const { state, saveCreds } =
    await useMultiFileAuthState("./auth/session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {

    const code =
      await sock.requestPairingCode(
        PHONE_NUMBER
      );

    console.clear();

    console.log(`
╔════════════════════════════╗
      🤖 ${BOT_NAME}
╚════════════════════════════╝

🔗 CONNEXION

PAIRING CODE :
${code}

━━━━━━━━━━━━━━━━━━
`);
  }

  sock.ev.on("connection.update", ({ connection }) => {

    if (connection === "open") {

      console.log(`
✅ ${BOT_NAME} connecté !
`);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {

    const msg = messages[0];

    if (!msg.message) return;

    const from = msg.key.remoteJid;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (text === ".ping") {
      await sock.sendMessage(from, {
        text: "🏓 Pong !"
      });
    }

    if (text === ".menu") {
      await sock.sendMessage(from, {
        text: MENU
      });
    }

    if (text === ".owner") {
      await sock.sendMessage(from, {
        text: "👑 Propriétaire du bot"
      });
    }

    if (text === ".help") {
      await sock.sendMessage(from, {
        text: MENU
      });
    }
  });
}

startBot();