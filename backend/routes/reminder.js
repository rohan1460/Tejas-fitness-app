const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const cron = require("node-cron");

router.get("/settings", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("reminderEnabled reminderTime");
    res.json({
      enabled: user.reminderEnabled || false,
      time: user.reminderTime || "09:00"
    });
  } catch (err) {
    res.status(500).json({ error: "Server error!" });
  }
});

router.put("/settings", authMiddleware, async (req, res) => {
  const { enabled, time } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.id, {
      reminderEnabled: enabled,
      reminderTime: time
    });
    res.json({ message: "Reminder settings updated!" });
  } catch (err) {
    res.status(500).json({ error: "Server error!" });
  }
});

router.get("/check", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date().toDateString();
    const lastWorkoutDate = user.lastWorkout ? new Date(user.lastWorkout).toDateString() : null;
    const workedOutToday = lastWorkoutDate === today;
    
    const reminders = [];
    
    if (user.reminderEnabled && !workedOutToday) {
      reminders.push({
        type: "workout",
        title: "💪 Time to Workout!",
        body: `Don't break your ${user.streak} day streak! 🔥`,
        action: "/workout"
      });
    }
    
    res.json({ reminders });
  } catch (err) {
    res.status(500).json({ error: "Server error!" });
  }
});

cron.schedule("0 9 * * *", async () => {
  console.log("🔔 Checking for daily reminders...");
  const users = await User.find({ reminderEnabled: true });
  console.log(`📋 ${users.length} users need reminders today`);
});

module.exports = router;