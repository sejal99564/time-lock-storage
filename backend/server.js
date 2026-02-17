const mongoose = require("mongoose");
const cron = require("node-cron");
require("dotenv").config();

const app = require("./src/app");
const cleanupExpiredFiles = require("./src/services/cleanupService");

const PORT = process.env.PORT || 5000;

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error(err));

// ⏰ Schedule cleanup job (every minute)
cron.schedule("* * * * *", () => {
  console.log("⏳ Running cleanup job...");
  cleanupExpiredFiles();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
