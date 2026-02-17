const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Route imports
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/files", fileRoutes);

// Root / health check
app.get("/", (req, res) => {
  res.send("Time-Lock Storage Backend Running 🚀");
});

module.exports = app;
