const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v26.0";

app.get("/", (req, res) => {
  res.status(200).send("AGP WhatsApp Bot is running");
})app.get("/privacy", (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Politique de confidentialité - AGP Communication</title>
      </head>
      <body>
        <h1>Politique de confidentialité</h1>
        <p>AGP Communication respecte la confidentialité de ses utilisateurs.</p>
        <p>Les informations reçues via WhatsApp sont utilisées uniquement pour répondre aux demandes des clients et fournir nos services.</p>
        <p>Nous ne vendons pas les données personnelles des utilisateurs.</p>
        <p>Pour toute demande concernant vos données, contactez AGP Communication.</p>
      </body>
    </html>
  `);
});

// Vérification du webhook Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Réception des messages WhatsApp
app.post("/webhook", async (req, res) => {
  // Répondre immédiatement à Meta
  res.sendStatus(200);

  try {
    const message =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) return;

    // Pour commencer : messages texte uniquement
    if (message.type !== "text") return;

    const from = message.from;
    const text = message.text?.body?.trim() || "";
    const lowerText = text.toLowerCase();

    let reply =
      "Bonjour 👋 Bienvenue chez AGP Communication !\n\n" +
      "Je suis votre assistant WhatsApp 🤖\n\n" +
      "Comment pouvons-nous vous aider ?\n\n" +
      "1️⃣ Tarifs\n" +
      "2️⃣ Réservation\n" +
      "3️⃣ Nos services\n" +
      "4️⃣ Parler à un responsable";

    if (
      lowerText.includes("bonjour") ||
      lowerText.includes("salut") ||
      lowerText.includes("bonsoir")
    ) {
      reply =
        "Bonjour 👋 Bienvenue chez AGP Communication !\n\n" +
        "Comment pouvons-nous vous aider ?\n\n" +
        "1️⃣ Tarifs\n" +
        "2️⃣ Réservation\n" +
        "3️⃣ Nos services\n" +
        "4️⃣ Parler à un responsable";
    }

    await sendWhatsAppMessage(from, reply);

  } catch (error) {
    console.error("Erreur webhook :", error.message);
  }
});

// Envoyer une réponse WhatsApp
async function sendWhatsAppMessage(to, body) {
  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/` +
    `${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: {
        body: body
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `WhatsApp API ${response.status}: ${JSON.stringify(data)}`
    );
  }

  console.log("Message WhatsApp envoyé.");
}

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AGP WhatsApp Bot running on port ${PORT}`);
});                                                            
