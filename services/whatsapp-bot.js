const { resolve } = require("path");
require("dotenv").config({ path: resolve(process.cwd(), ".env") });
const qrcode = require("qrcode-terminal");

const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion
} = require("baileys");

const pino = require("pino");
const NodeCache = require("node-cache");

let sock;

/* =========================
  UTILITIES
========================= */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/* =========================
  BOT READY PROMISE
========================= */
let botReadyResolve;
const botReady = new Promise(res => (botReadyResolve = res));

/* =========================
  MESSAGE QUEUE
========================= */
const messageQueue = [];
const MAX_CONCURRENT = 3;
let activeSends = 0;

/* =========================
  CONTACT BRAIN (LONG-TERM)
========================= */
const contactBrain = new Map();

function getBrain(jid) {
  if (!contactBrain.has(jid)) {
    contactBrain.set(jid, {
      avgReplyDelay: randomInt(3000, 12000),
      lastIncoming: 0,
      lastOutgoing: 0,
      dailyCap: randomInt(1, 4),
      sentToday: 0,
      risk: 0
    });
  }
  return contactBrain.get(jid);
}

/* =========================
  ADAPTIVE DELAY
========================= */
async function adaptiveDelay(brain) {
  const chaos = randomInt(-15, 15) / 100 * brain.avgReplyDelay;
  let delay = brain.avgReplyDelay + chaos;

  delay = Math.min(delay, 15000);
  delay = Math.max(delay, 2000);

  await sleep(delay);
}

/* =========================
  HUMAN TYPING
========================= */
async function humanTyping(jid) {
  await sock.sendPresenceUpdate("composing", jid);
  await sleep(randomInt(1500, 10000));
}

/* =========================
  NEAR-INVISIBLE SEND
========================= */
async function nearInvisibleSend(to, rawText) {
  const jid = `${to}@s.whatsapp.net`;
  const brain = getBrain(jid);

  await adaptiveDelay(brain);
  await humanTyping(jid);

  try {
    await sock.sendMessage(jid, { text: rawText });
  } catch {
    brain.risk = Math.min(brain.risk + 1, 10);
    return false;
  }

  brain.lastOutgoing = Date.now();
  brain.sentToday++;
  return true;
}

/* =========================
  QUEUE PROCESSOR
========================= */
async function processQueue() {
  while (activeSends < MAX_CONCURRENT && messageQueue.length > 0) {
    const { to, text, resolve, reject } = messageQueue.shift();
    activeSends++;

    nearInvisibleSend(to, text)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        activeSends--;
        processQueue();
      });
  }
}

/* =========================
  SAFE SEND
========================= */
async function sendMessage(to, text) {
  await botReady; // wait until WhatsApp is connected

  return new Promise((resolve, reject) => {
    messageQueue.push({ to, text, resolve, reject });
    setImmediate(processQueue);
  });
}

/* =========================
  DAILY RESET
========================= */
setInterval(() => {
  for (const brain of contactBrain.values()) {
    brain.sentToday = 0;
    brain.dailyCap = randomInt(1, 4);
    brain.risk = Math.max(brain.risk - 1, 0);
  }
}, 24 * 60 * 60_000);

/* =========================
  BOT INIT
========================= */
async function startWhatsAppBot() {
  try {
    let { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
    const msgRetryCounterCache = new NodeCache();

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      syncFullHistory: false,
      msgRetryCounterCache,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      defaultQueryTimeoutMs: 60000,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
    });

    
    // Save credentials when they update
    sock.ev.on("creds.update", saveCreds);

      // 🔐 Pairing code instead of QR
      if (!sock.authState.creds.registered) {
        let phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
        phoneNumber = phoneNumber.replace(/[^0-9]/g, ''); // Remove non-digit characters

        if (!phoneNumber) {
          console.error("❌ WHATSAPP_PHONE_NUMBER not set in .env");
          process.exit(1);
        }

        setTimeout(async () => {
          try {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code; // Format as XXXX-XXXX if possible
            console.log("\n🔑 Pairing code:", code);
            console.log(`\nPlease enter this code in your WhatsApp app:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the code shown above`)
          } catch (error) {
            console.error('Error requesting pairing code:', error?.stack || error);
          }
        }, 5000);
      
    };
    
    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {

      if (qr) {
        console.log("📱 Scan QR");
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'connecting') {
        console.log('🔄 Connecting to WhatsApp...');
      };


      if (connection === "open") {
        console.log("✅ Bot connected (near-invisible)");
        botReadyResolve();
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        if (code !== DisconnectReason.loggedOut) {
          setTimeout(startWhatsAppBot, 5000);
        } else {
          console.log("❌ Logged out");
        }
      }
    });

    // Learn from replies
    sock.ev.on("messages.upsert", ({ messages }) => {
      const msg = messages[0];
      if (!msg?.message || msg.key.fromMe) return;

      const jid = msg.key.remoteJid.split("@")[0];//msg.key.remoteJid.replace("@s.whatsapp.net", "");
      const brain = getBrain(jid);
      const now = Date.now();

      if (brain.lastOutgoing) {
        const delta = now - brain.lastOutgoing;
        brain.avgReplyDelay = Math.min(
          brain.avgReplyDelay * 0.7 + delta * 0.3,
          15000
        );
      }

      brain.lastIncoming = now;

      // // Clear message retry cache to prevent memory bloat
      if (sock?.msgRetryCounterCache) {
        sock.msgRetryCounterCache.clear()
      };

    });

    // Track recently-notified callers to avoid spamming messages
    const antiCallNotified = new Set();
    sock.ev.on('call', async (calls) => { 
      try {
        for (const call of calls) {
                const callerJid = call.from || call.peerJid || call.chatId;
                if (!callerJid) continue;
                try {
                    // First: attempt to reject the call if supported
                    try {
                        if (typeof sock.rejectCall === 'function' && call.id) {
                            await sock.rejectCall(call.id, callerJid);
                        } else if (typeof sock.sendCallOfferAck === 'function' && call.id) {
                            await sock.sendCallOfferAck(call.id, callerJid, 'reject');
                        }
                    } catch {}

                    // Notify the caller only once within a short window
                    if (!antiCallNotified.has(callerJid)) {
                        antiCallNotified.add(callerJid);
                        setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                        await sock.sendMessage(callerJid, { text: '📵 Your call was intentionally rejected.' });
                    }
                } catch {}
                
                // block after a short delay to ensure rejection and message are processed if needed
                // setTimeout(async () => {
                //     try { await sock.updateBlockStatus(callerJid, 'block'); } catch {}
                // }, 800);
          
            }
      } catch (_) {
        console.error('Error handling call event:', _?.stack || _);
      }
    })  

    setInterval(() => {
      const now = Date.now();
      for (const [jid, brain] of contactBrain) {
        if (now - brain.lastIncoming > 1 * 24 * 60 * 60_000) {
          contactBrain.delete(jid);
        }
      }
      console.log("✅ Brain cleanup done");
    }, 1 * 60 * 60_000);

  } catch (err) {
    console.error("❌ Startup error:", err.stack);
    setTimeout(startWhatsAppBot, 5000);
  }
};

/* =========================
  EXPORT
========================= */
module.exports = {
  startWhatsAppBot,
  sendMessage
};