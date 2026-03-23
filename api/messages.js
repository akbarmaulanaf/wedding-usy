export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      const googleAppsScriptURL = "https://script.google.com/macros/s/AKfycbwocsvMlmfKewFjylergmIsfxNkROZjMUNVHnmXfcSKe4s8RmMaRHA1t8Gh8_DedpZi/exec?action=getData";

      const response = await fetch(googleAppsScriptURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: `Google Apps Script returned status ${response.status}`,
        });
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error: " + error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
