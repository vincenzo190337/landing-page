// Vercel Serverless Function — টোকেন এখানে লেখা নেই।
// Vercel → Settings → Environment Variables-এ দিন:
//   TELEGRAM_BOT_TOKEN = আপনার বটের টোকেন
//   TELEGRAM_CHAT_ID   = 8738715995
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST ছাড়া চলবে না" });
  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chat = (process.env.TELEGRAM_CHAT_ID || "8738715995").trim();
  if (!token) return res.status(500).json({ ok: false, error: "Vercel-এ TELEGRAM_BOT_TOKEN সেট করা নেই" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const text = String((body && body.text) || "").slice(0, 3500);
  if (!text.startsWith("🛍 নতুন অর্ডার")) return res.status(400).json({ ok: false, error: "অবৈধ অনুরোধ" });

  try {
    const r = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: text })
    });
    const j = await r.json().catch(() => ({}));
    return res.status(j.ok ? 200 : 502).json({ ok: !!j.ok, description: j.description || "" });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "Telegram-এ পৌঁছানো যায়নি" });
  }
};
