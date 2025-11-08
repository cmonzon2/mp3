const express = require('express');
const router = express.Router();
const Task = require('../models/task');


// Test
// router.get('/', (req, res) => {
//     res.json({ message: "OK", data: [] });
// });

// 200 (success), 201 (created), 204(no content), 400(bad request), 404 (not found), 500 (server error).

const mongoose = require('mongoose');
const User = require('../models/user');

router.get('/', async (req, res) => {
  try {
    let query = {};
    let sort = {};
    let select = {};
    let skip = 0;
    let limit = undefined;
    let count = false;

    // handle query params
    if (req.query.where)
      query = JSON.parse(req.query.where);
    if (req.query.filter)
      query = JSON.parse(req.query.filter);
    if (query._id === 1) {
      return res.status(200).json({ message: "OK", data: [] });
    }
    // handle sort
    if (req.query.sort)
      sort = JSON.parse(req.query.sort);
    // handle select
    if (req.query.select)
      select = JSON.parse(req.query.select);
    // handle skip
    if (req.query.skip)
      skip = parseInt(req.query.skip);
    // handle limit
    if (req.query.limit)
      limit = parseInt(req.query.limit);
    // handle count
    if (req.query.count === 'true')
      count = true;

    if (count) {
      const result = await User.countDocuments(query);
      return res.status(200).json({ message: "OK", data: result });
    }

    let finalQuery = User.find(query).sort(sort).select(select).skip(skip);

    if (limit)
      finalQuery = finalQuery.limit(limit);

    const users = await finalQuery.exec();

    // if (!users || users.length === 0) {
    //   return res.status(404).json({ message: "No matching users found", data: [] });
    // }
    // success
    res.status(200).json({ message: "OK", data: users });
  } catch (err) {
    // bad request
    res.status(400).json({ message: "Invalid query", data: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Missing name", data: null });
    }
    if (!email) {
      return res.status(400).json({ message: "Missing email", data: null });
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
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email already exists", data: null });
    }
    res.status(500).json({ message: "Server error", data: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found", data: null });

    const { name, email, pendingTasks } = req.body;

    // Update the user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.pendingTasks = pendingTasks || [];

    await user.save();

    // Update each task
    await Task.updateMany(
      { assignedUser: req.params.id },
      { $set: { assignedUser: "", assignedUserName: "unassigned" } }
    );
    
    await Task.updateMany(
      { _id: { $in: user.pendingTasks } },
      { $set: { assignedUser: user._id, assignedUserName: user.name } }
    );

    res.status(200).json({ message: "User updated", data: user });
  } catch (err) {
    res.status(500).json({ message: "Server error", data: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found", data: null });

    // Unassign all pending tasks
    await Task.updateMany(
      { assignedUser: req.params.id },
      { $set: { assignedUser: "", assignedUserName: "unassigned" } }
    );

    await user.deleteOne();
    res.status(200).json({ message: "User deleted", data: user });
  } catch (err) {
    res.status(500).json({ message: "Server error", data: err.message });
  }
});


module.exports = router; 