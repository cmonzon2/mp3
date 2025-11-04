const express = require('express');
const router = express.Router();
const Task = require('../models/task');

router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.where) query = JSON.parse(req.query.where);
    else if (req.query.filter) query = JSON.parse(req.query.filter);

    const tasks = await Task.find(query);
    res.status(200).json({ message: "OK", data: tasks });
  } catch (err) {
    res.status(400).json({ message: "Invalid query", data: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, deadline, assignedUser, assignedUserName, completed } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Missing name", data: null });
    }
    if (!deadline) {
      return res.status(400).json({ message: "Missing deadline", data: null });
    }

    const newTask = new Task({
      name,
      description,
      deadline: new Date(Number(deadline)),
      assignedUser,
      assignedUserName,
      completed: completed === 'true',
      dateCreated: new Date()
    });

    const savedTask = await newTask.save();
    res.status(201).json({ data: { _id: savedTask._id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", data: err.message });
  }
});

module.exports = router; 
