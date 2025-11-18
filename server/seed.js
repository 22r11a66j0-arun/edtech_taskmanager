require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcrypt");

(async () => {
  try {
    await connectDB();

    const teacherEmail = "teacher@example.com";
    const teacherPassword = "Teacher@123";

    const studentEmail = "student@example.com";
    const studentPassword = "Student@123";

    let teacher = await User.findOne({ email: teacherEmail });
    if (!teacher) {
      const pass = await bcrypt.hash(teacherPassword, 10);
      teacher = await User.create({
        email: teacherEmail,
        passwordHash: pass,
        role: "teacher"
      });
    }

    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      const pass = await bcrypt.hash(studentPassword, 10);
      student = await User.create({
        email: studentEmail,
        passwordHash: pass,
        role: "student",
        teacherId: teacher._id
      });
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
