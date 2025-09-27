const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },   // already unique hai
  phone: { type: String, required: true, unique: true },   // make unique
  department: { type: String, required: true },
  status: { type: String, default: "Active" },
  joinDate: { type: Date, default: Date.now },
  password: { type: String, required: true },
  resetToken: { type: String },        
  resetTokenExpiry: { type: Date }     
});


// Hash krna h password ko save krne se phle
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
employeeSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);
