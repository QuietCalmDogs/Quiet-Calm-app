module.exports = function handler(req, res) {
  res.status(200).json({
    message: "Function is reachable",
    hasKey: !!process.env.ANTHROPIC_KEY,
    keyPreview: process.env.ANTHROPIC_KEY 
      ? process.env.ANTHROPIC_KEY.substring(0, 8) + "..." 
      : "NOT FOUND"
  });
};
