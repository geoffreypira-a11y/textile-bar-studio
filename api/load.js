const { list } = require("@vercel/blob");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN manquant" });
  }

  try {
    const { blobs } = await list({ prefix: "studio-data", token, limit: 1 });

    if (!blobs.length) return res.status(200).json(null);

    const r = await fetch(blobs[0].downloadUrl);
    if (!r.ok) return res.status(200).json(null);

    return res.status(200).json(await r.json());
  } catch (e) {
    console.error("load error:", e.message);
    return res.status(200).json(null);
  }
};
