module.exports = async function handler(req, res) {
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
    
    // Return the FULL response so we can see exactly what Anthropic sends back
    // This includes any error messages from Anthropic's side
    res.status(200).json({
      status: response.status,
      ok: response.ok,
      data: data
    });

  } catch (error) {
    res.status(500).json({ 
      error: "Function failed", 
      details: error.message 
    });
  }
};
