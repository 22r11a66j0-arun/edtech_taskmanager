const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signup = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid("student","teacher").required(),
      teacherId: Joi.string().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.message });

    const { email, password, role, teacherId } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return next({ status: 400, message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      role,
      teacherId: role === "student" ? teacherId : undefined
    });

    res.json({ success: true, message: "User registered!" });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.message });

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next({ status: 400, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return next({ status: 400, message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      userId: user._id
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { signup, login, me };
