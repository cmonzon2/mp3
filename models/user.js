// Load required packages
var mongoose = require('mongoose');

// "name" - String
// "email" - String
// "pendingTasks" - [String] - The _id fields of the pending tasks that this user has
// "dateCreated" - Date - should be set automatically by server
// Define our user schema
// Users cannot be created (or updated) without a name or email. 
// All other fields that the user did not specify should be set to 
// reasonable values.
var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
    },
    email: { 
        type: String,
        required: true,
        unique: true 
    },
    pendingTasks: { 
        type: [String], 
        default: [] 
    },
    dateCreated: { 
        type: Date, 
        default: Date.now 
    }
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
