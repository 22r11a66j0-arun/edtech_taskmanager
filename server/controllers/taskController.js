const Task = require("../models/Task");
const User = require("../models/User");

const getTasks = async (req, res, next) => {
  try {
    if (req.user.role === "student") {
      const tasks = await Task.find({ userId: req.user._id });
      return res.json({ success: true, tasks });
    }

    if (req.user.role === "teacher") {
      const students = await User.find({ teacherId: req.user._id });
      const studentIds = students.map(s => s._id);

      const tasks = await Task.find({ userId: { $in: [req.user._id, ...studentIds] } });

      return res.json({ success: true, tasks });
    }

    res.status(403).json({ success: false, message: "Unauthorized role" });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (String(userId) !== String(req.user._id)) {
      return next({ status: 403, message: "Cannot create tasks for others" });
    }

    const task = await Task.create(req.body);
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next({ status: 404, message: "Task not found" });

    if (String(task.userId) !== String(req.user._id)) {
      return next({ status: 403, message: "You can only update your own tasks" });
    }

    Object.assign(task, req.body);
    await task.save();

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next({ status: 404, message: "Task not found" });

    if (String(task.userId) !== String(req.user._id)) {
      return next({ status: 403, message: "You can only delete your own tasks" });
    }

    await task.deleteOne();
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
