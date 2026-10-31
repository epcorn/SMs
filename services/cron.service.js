import otherServices from "./other.service.js";

export const cronService = async (req, res) => {
  // Simple security check using a secret header or query param
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Running production reminder notification via API trigger...");
    const result = await otherServices.reminderNotification();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Cron execution error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const autoCheckoutUser=async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Running Vercel scheduled auto-checkout...");
    const result = await otherServices.autoCheckOut();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Auto-checkout cron error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}