const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Document = require("../models/Document");
const User = require("../models/User"); // Employee model

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Allowed MIME types
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Multer upload config
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const extname = /\.(jpeg|jpg|png|pdf|doc|docx)$/i.test(file.originalname);
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only images, PDFs, or Word documents are allowed"));
  },
});

// ✅ Upload document (employee taken from JWT)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const employeeId = req.user.employeeId; // from JWT
    if (!employeeId) return res.status(401).json({ message: "Unauthorized" });

    const { category, description } = req.body;

    const newDoc = new Document({
      name: req.file.originalname,
      size: (req.file.size / (1024 * 1024)).toFixed(2) + " MB",
      path: `uploads/${req.file.filename}`,
      employeeId,
      category: category || "Uncategorized",
      description: description || "",
      status: "Processing",
    });

    await newDoc.save();
    res.status(201).json({ message: "Document uploaded successfully", document: newDoc });
  } catch (err) {
    console.error("❌ Upload error:", err.message || err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};

// ✅ Get documents for logged-in employee
const getEmployeeDocuments = async (req, res) => {
  try {
    const employeeId = req.user.employeeId; // from JWT
    const documents = await Document.find({ employeeId }).sort({ uploaded: -1 });
    res.json(documents);
  } catch (err) {
    console.error("❌ Fetch documents error:", err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};

// ✅ Admin: Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ uploaded: -1 });

    // Optional: populate employee name for admin view
    const docsWithEmployeeNames = await Promise.all(
      documents.map(async (doc) => {
        const user = await User.findOne({ employeeId: doc.employeeId });
        return {
          ...doc.toObject(),
          employeeName: user ? user.name : doc.employeeId,
        };
      })
    );

    res.json(docsWithEmployeeNames);
  } catch (err) {
    console.error("❌ Fetch all documents error:", err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};

// ✅ Admin: Update document status
const updateDocumentStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.status = status;
    if (status === "Declined" && message) doc.description = message;

    await doc.save();
    res.json({ message: "Document status updated", document: doc });
  } catch (err) {
    console.error("❌ Update document status error:", err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getEmployeeDocuments,
  getAllDocuments,
  updateDocumentStatus,
};
