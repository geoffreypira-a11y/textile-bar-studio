const { list } = require("@vercel/blob");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { blobs } = await list({
      prefix: "studio-data",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      limit: 1,
    });

    if (!blobs.length) return res.status(200).json(null);

    const r = await fetch(blobs[0].downloadUrl);
    if (!r.ok) return res.status(200).json(null);

    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    console.error("load error:", e);
    return res.status(200).json(null);
  }
};
