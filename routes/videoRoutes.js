const express = require("express");
const Video = require("../models/Video");

const router = express.Router();

// Add dummy data
router.post("/add", async (req, res) => {
  const dummyVideo = new Video({
    title: "NEOGEN Demo Video",
    description: "This is a sample video added for testing.",
    views: 1000,
    tags: ["AI", "Automation", "YouTube"],
  });

  await dummyVideo.save();
  res.json({ message: "Dummy video added!" });
});

// Get all videos
router.get("/", async (req, res) => {
  const videos = await Video.find();
  res.json(videos);
});

module.exports = router;
