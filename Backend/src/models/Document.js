const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "Uncategorized" },
    description: { type: String, default: "" },
    size: { type: String },
    uploaded: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ["Processing", "Accepted", "Declined"], 
      default: "Processing" 
    },
    employeeId: { type: String, ref: "Employee", required: true }, // ✅ String instead of ObjectId
    path: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
