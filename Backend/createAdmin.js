const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    
    await User.deleteOne({ email: "admin@company.com" });
    console.log("Old admin deleted (if existed)");

    
    const admin = new User({
      name: "Super Admin",
      email: "admin@company.com",
      password: "Admin@123",
      role: "Admin",
      department: "Management",
    });

    await admin.save();
    console.log("✅ Admin created in Atlas:", admin.email);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
})();
