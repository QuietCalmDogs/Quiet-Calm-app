export default async function handler(req, res) {
  // Only allow POST requests — reject anything else
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Forward the request to Anthropic using the key stored securely in Vercel
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.VITE_ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    // Send the response back to your app
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "API call failed" });
  }
}
