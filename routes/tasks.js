const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const User = require('../models/user');


router.get('/', async (req, res) => {
  try {
    let query = {};
    let sort = {};
    let select = {};
    let skip = 0;
    let limit = 100;
    let count = false;

    // handle query params
    if (req.query.where)
      query = JSON.parse(req.query.where);
    if (req.query.filter)
      query = JSON.parse(req.query.filter);
    // handle sort
    // hard coded handling query id for running db scripts
    if (query._id === 1) {
      return res.status(200).json({ message: "OK", data: [] });
    }
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

    // handle count thru api
    if (count) {
      const total = await Task.countDocuments(query);
      return res.status(200).json({ message: "OK", data: total });
    }
    // https://mongoosejs.com/docs/queries.html
    let finalQuery = Task.find(query).sort(sort).select(select).skip(skip).limit(limit);

    const tasks = await finalQuery.exec();

    //  if (!tasks || tasks.length === 0) {
    //   return res.status(404).json({ message: "No matching tasks found", data: [] });
    // }
    res.status(200).json({ message: "OK", data: tasks });
  } catch (err) {
    // handle duplicates
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Duplicate value entered", data: err.message });
    }
    return res.status(400).json({ message: "Invalid query", data: err.message });
  }
});

// 200 (success), 201 (created), 204(no content), 400(bad request), 404 (not found), 500 (server error).

router.post('/', async (req, res) => {
  try {
    const { name, description, deadline, assignedUser, assignedUserName, completed } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Missing name", data: null });
    }
    if (!deadline) {
      return res.status(400).json({ message: "Missing deadline", data: null });
    }
    let newTask = new Task({
      name: name,
      description: description,
      deadline: deadline,
      assignedUser: assignedUser,
      assignedUserName: assignedUserName,
      completed: completed === true,
      dateCreated: new Date()
    });

    const savedTask = await newTask.save();

    return res.status(201).json({message: "Task successfully created",
      data: {
        _id: savedTask._id,
        name: savedTask.name,
        description: savedTask.description,
        deadline: savedTask.deadline,
        assignedUser: savedTask.assignedUser,
        assignedUserName: savedTask.assignedUserName,
        completed: savedTask.completed,
        dateCreated: savedTask.dateCreated
      }});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", data: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task)
      return res.status(404).json({ message: "Task not found", data: null });

    const { name, description, deadline, completed, assignedUser, assignedUserName } = req.body;

    // PUT a Task with assignedUser and assignedUserName

    // Reassigned task -> remove from old user's pendingTasks
    if (task.assignedUser) {
      if (task.assignedUser !== assignedUser) {
        await User.updateOne(
          { _id: task.assignedUser },
          { $pull: { pendingTasks: req.params.id } }
        );
      }
    }

    task.name = name;
    task.description = description;
    dl = new Date(deadline)
    if (!deadline)
      dl = task.deadline
    task.deadline = dl;
    task.completed = (completed === 'true' || completed === true);
    task.assignedUser = assignedUser;
    task.assignedUserName = assignedUserName;

    await task.save();

    // Add task to the new user pendingTasks
    if (assignedUser && !task.completed) {
      await User.updateOne(
        { _id: assignedUser },
        { $addToSet: { pendingTasks: req.params.id } }
      );
    }

    res.status(200).json({ message: "Task updated", data: task });
  } catch (err) {
    res.status(500).json({ message: "Server error", data: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    // DELETE a Task should remove the task from its assignedUser's pendingTasks
    const task = await Task.findById(req.params.id);
    if (!task)
      return res.status(404).json({ message: "Task not found", data: null });

    if (task.assignedUser) {
      await User.updateOne(
        { _id: task.assignedUser },
        { $pull: { pendingTasks: req.params.id } }
      );
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted", data: task });
  } catch (err) {
    res.status(500).json({ message: "Server error", data: err.message });
  }
});


module.exports = router; 
