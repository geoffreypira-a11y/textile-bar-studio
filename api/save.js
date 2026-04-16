const { put, list, del } = require("@vercel/blob");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = process.env.BLOB1_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: "Token manquant" });

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    // Supprimer anciens blobs
    try {
      const { blobs } = await list({ prefix: "studio-data", token });
      if (blobs.length > 0) await del(blobs.map(b => b.url), { token });
    } catch(e) { console.error("del:", e.message); }

    // Sauvegarder — mode public obligatoire avec cette version du SDK
    await put("studio-data.json", JSON.stringify({ ...payload, savedAt: new Date().toISOString() }), {
      access: "public",
      token,
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return res.status(200).json({ ok: true });
  } catch(e) {
    console.error("save error:", e.message);
    return res.status(500).json({ error: e.message });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: "10mb" } } };
