const Attendance = require("../models/Attendance");

// Clock in/out
exports.clock = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { ip } = req.body;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) {
      // Clock In
      attendance = new Attendance({
        userId,
        date: today,
        clockIn: new Date(),
        status: "Present",
        locationIP: ip || "Unknown IP"
      });
      await attendance.save();
      return res.json({ allowed: true, message: "Clocked In successfully!" });
    } else if (!attendance.clockOut) {
      // Clock Out
      attendance.clockOut = new Date();
      const totalMinutes = Math.floor((attendance.clockOut - attendance.clockIn) / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      attendance.totalHours = `${hours}h ${minutes}m`;
      attendance.status = "Present";
      await attendance.save();
      return res.json({ allowed: true, message: "Clocked Out successfully!" });
    } else {
      return res.json({ allowed: false, message: "Already Clocked Out today" });
    }
  } catch (err) {
    console.error("❌ Clock error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Auto logout
exports.autoLogout = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ userId, date: today });
    if (attendance && !attendance.clockOut) {
      attendance.clockOut = new Date();
      attendance.status = "Auto Logged Out";
      await attendance.save();
    }
    res.json({ message: "Auto logged out" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Get attendance history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id; // fallback to logged-in user
    const records = await Attendance.find({ userId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
