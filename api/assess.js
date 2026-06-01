module.exports = async function handler(req, res) {

  // Allow the browser to make cross-origin requests to this function
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Browsers send a preflight OPTIONS request before the real POST —
  // we need to respond to it with 200 or the real request never gets sent
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // If Anthropic returned an error, pass it through directly
    // so the app can show us the real message instead of a generic one
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Anthropic returned an error",
        anthropicError: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Function crashed",
      details: error.message
    });
  }
};
