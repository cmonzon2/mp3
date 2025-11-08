const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// "name" - String
// "description" - String
// "deadline" - Date
// "completed" - Boolean
// "assignedUser" - String - The _id field of the user this task is assigned to - default ""
// "assignedUserName" - String - The name field of the user this task is assigned to - default "unassigned"
// "dateCreated" - Date - should be set automatically by server to present date
const TaskSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: "" 
  },
  deadline: { 
    type: Date, 
    required: true 
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  assignedUser: { 
    type: String, 
    default: "" 
  },
  assignedUserName: { 
    type: String, 
    default: "unassigned" 
  },
  dateCreated: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Task', TaskSchema);
