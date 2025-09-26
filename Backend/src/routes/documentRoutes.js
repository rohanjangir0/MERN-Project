const express = require("express");
const { upload, uploadDocument, getEmployeeDocuments, getAllDocuments } = require("../controllers/documentController");

const router = express.Router();

// Upload route
// documentRoutes.js
router.post("/upload", upload.single("file"), uploadDocument); // "file" is multer key
router.get("/employee/:id", getEmployeeDocuments); // fetch by employeeId
router.get("/all", getAllDocuments); // admin


module.exports = router;
