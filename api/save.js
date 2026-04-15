import { put, list, del } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Supprimer l'ancienne version
    const { blobs } = await list({
      prefix: "studio-data",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (blobs.length > 0) {
      await del(blobs.map((b) => b.url), {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }

    // Sauvegarder la nouvelle version
    const body = JSON.stringify({
      ...req.body,
      savedAt: new Date().toISOString(),
    });

    await put("studio-data.json", body, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("save error:", e);
    return res.status(500).json({ error: e.message });
  }
}
