const express = require("express");
const router = express.Router();
const fs = require("fs");

const protect = require("../middlewares/authMiddleware");
const upload = require("../utils/multerConfig");
const User = require("../models/User");
const File = require("../models/File");

/**
 * =========================
 * 📤 Upload file + expiry
 * =========================
 */
router.post(
  "/upload",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileSizeMB = req.file.size / (1024 * 1024);
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Storage limit check
      if (user.storageUsedMB + fileSizeMB > user.storageLimitMB) {
        return res.status(400).json({
          message: "Storage limit exceeded. Upgrade your plan.",
        });
      }

      // ⏳ Expiry based on user selection
      const { expiry } = req.body;
      const expiresAt = new Date();

      if (expiry === "1h") {
        expiresAt.setHours(expiresAt.getHours() + 1);
      } else if (expiry === "1d") {
        expiresAt.setDate(expiresAt.getDate() + 1);
      } else {
        expiresAt.setDate(expiresAt.getDate() + 7); // default 7 days
      }

      // Save file metadata
      const fileDoc = await File.create({
        user: user._id,
        originalName: req.file.originalname,
        storedName: req.file.filename,
        fileType: req.file.mimetype,
        sizeMB: fileSizeMB,
        filePath: req.file.path,
        expiresAt,
      });

      // Update user storage
      user.storageUsedMB += fileSizeMB;
      await user.save();

      res.status(201).json({
        message: "File uploaded & saved successfully",
        fileId: fileDoc._id,
        expiresAt,
        storage: {
          usedMB: user.storageUsedMB.toFixed(2),
          limitMB: user.storageLimitMB,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * =========================
 * 📂 Get user's files
 * =========================
 */
router.get("/my", protect, async (req, res) => {
  try {
    const files = await File.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * =========================
 * 📥 Download file (B3 FIX)
 * =========================
 */
router.get("/download/:id", protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Ownership check
    if (file.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ⛔ BLOCK expired files
    if (new Date(file.expiresAt) <= new Date()) {
      return res.status(410).json({
        message: "File has expired and cannot be downloaded",
      });
    }

    res.download(file.filePath, file.originalName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Download failed" });
  }
});

/**
 * =========================
 * 🗑️ Delete file
 * =========================
 */
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Remove file from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Update storage
    const user = await User.findById(req.user._id);
    user.storageUsedMB = Math.max(user.storageUsedMB - file.sizeMB, 0);
    await user.save();

    await file.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
});

/**
 * =========================
 * ⏳ Extend file expiry
 * =========================
 */
router.patch("/extend/:id", protect, async (req, res) => {
  try {
    const { extendBy } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    let additionalMs = 0;
    if (extendBy === "1h") additionalMs = 60 * 60 * 1000;
    if (extendBy === "1d") additionalMs = 24 * 60 * 60 * 1000;
    if (extendBy === "7d") additionalMs = 7 * 24 * 60 * 60 * 1000;

    if (!additionalMs) {
      return res.status(400).json({ message: "Invalid extension value" });
    }

    file.expiresAt = new Date(file.expiresAt.getTime() + additionalMs);
    await file.save();

    res.json({
      message: "Expiry extended successfully",
      expiresAt: file.expiresAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to extend expiry" });
  }
});

module.exports = router;
