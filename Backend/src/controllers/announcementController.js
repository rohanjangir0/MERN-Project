const Announcement = require("../models/Announcement");

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }); //-1 ka matlab?
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ab nya annoucement bnaye ge
exports.createAnnouncement = async (req, res) => {
  try {
    const { subject, description } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ 
        message: "Subject and description required"
     });
    }

    const announcement = new Announcement({ subject, description });
    await announcement.save();

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
