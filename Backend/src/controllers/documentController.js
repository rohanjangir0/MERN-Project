const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../models/Document");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Upload document (employee)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newDoc = new Document({
      name: req.file.originalname,
      size: (req.file.size / (1024 * 1024)).toFixed(1) + " MB",
      path: `uploads/${req.file.filename}`,
      employeeId: req.body.employeeId,
      category: req.body.category || "Uncategorized",
      status: "Processing",
    });

    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Employee: Get documents
const getEmployeeDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ employeeId: req.params.id });
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Admin: Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find();
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getEmployeeDocuments,
  getAllDocuments,
};
