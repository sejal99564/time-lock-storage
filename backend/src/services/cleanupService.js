const fs = require("fs");
const path = require("path");
const File = require("../models/File");
const User = require("../models/User");

const cleanupExpiredFiles = async () => {
  try {
    const now = new Date();

    // Find expired files
    const expiredFiles = await File.find({
      expiresAt: { $lt: now },
    });

    if (expiredFiles.length === 0) {
      console.log("🟢 Cleanup: No expired files found");
      return;
    }

    for (const file of expiredFiles) {
      try {
        const filePath = path.join(
          __dirname,
          "../../",
          file.filePath
        );

        // Delete file from disk
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Update user storage
        const user = await User.findById(file.user);
        if (user) {
          user.storageUsedMB -= file.sizeMB;
          if (user.storageUsedMB < 0) user.storageUsedMB = 0;
          await user.save();
        }

        // Delete file record
        await File.findByIdAndDelete(file._id);

        console.log(
          `🗑️ Deleted expired file: ${file.originalName}`
        );
      } catch (err) {
        console.error(
          `❌ Error deleting file ${file._id}`,
          err
        );
      }
    }
  } catch (error) {
    console.error("❌ Cleanup service error:", error);
  }
};

module.exports = cleanupExpiredFiles;
