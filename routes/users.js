const express = require('express');
const router = express.Router();

// Test
// router.get('/', (req, res) => {
//     res.json({ message: "OK", data: [] });
// });

const mongoose = require('mongoose');
const User = require('../models/user');

router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.filter) query = JSON.parse(req.query.filter);
    else if (req.query.where) query = JSON.parse(req.query.where);

    const users = await User.find(query);
    res.status(200).json({ message: "OK", data: users });
  } catch (err) {
    res.status(400).json({ message: "Invalid query", data: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Missing name / email", data: null });
    }

    const newUser = new User({
      name,
      email,
      pendingTasks: [],
      dateCreated: new Date()
    });

    const savedUser = await newUser.save();
    res.status(201).json({ data: { _id: savedUser._id, name: savedUser.name, email: savedUser.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", data: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found", data: null });
    }

    res.status(200).json({ data: { _id: updatedUser._id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", data: err.message });
  }
});

module.exports = router; 