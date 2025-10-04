const express = require("express");
const {
  upload,
  uploadDocument,
  getEmployeeDocuments,
  getAllDocuments,
  updateDocumentStatus,
} = require("../controllers/documentController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Employee routes (require auth)
router.post("/upload", authMiddleware, upload.single("file"), uploadDocument);
router.get("/employee", authMiddleware, getEmployeeDocuments);

// Admin routes
router.get("/all", authMiddleware, getAllDocuments);
router.patch("/:id/status", authMiddleware, updateDocumentStatus);

module.exports = router;
