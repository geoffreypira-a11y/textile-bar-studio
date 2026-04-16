const { put, list, del } = require("@vercel/blob");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN manquant" });
  }

  try {
    // Parse du body
    const payload = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body || {};

    const content = JSON.stringify({
      ...payload,
      savedAt: new Date().toISOString(),
    });

    // Supprimer les anciens blobs (ignorer les erreurs)
    try {
      const { blobs } = await list({ prefix: "studio-data", token });
      if (blobs.length > 0) {
        await del(blobs.map((b) => b.url), { token });
      }
    } catch (e) {
      console.error("del non-fatal:", e.message);
    }

    // Sauvegarder
    await put("studio-data.json", content, {
      access: "private",
      token,
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("save error:", e.message);
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
};

module.exports.config = {
  api: { bodyParser: { sizeLimit: "25mb" } },
};
