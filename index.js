import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import { getSystemPrompt } from "./prompt.js";
dotenv.config();
const app = express();
app.use(bodyParser.json());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const appointments = [];
const conversations = new Map();

app.get("/webhook", (req, res) => {
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
    res.status(200).send(req.query["hub.challenge"]);
  } else res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message || message.type!== "text") return;
    const from = message.from;
    const text = message.text.body;
    if (!conversations.has(from)) conversations.set(from, []);
    const history = conversations.get(from);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: getSystemPrompt() },...history.slice(-8), { role: "user", content: text }],
      max_tokens: 250
    });
    const reply = completion.choices[0].message.content;
    history.push({ role: "user", content: text }, { role: "assistant", content: reply });
    await axios.post(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      { messaging_product: "whatsapp", to: from, text: { body: reply } },
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
    );
  } catch (e) { console.error(e.response?.data || e.message); }
});

app.get("/", (req, res) => res.send(`<h1>Aisha Live ✅</h1><p>Appointments: ${appointments.length}</p>`));
app.listen(process.env.PORT || 3000, () => console.log("Aisha running"));
