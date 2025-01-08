"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Define the Mongoose Schema for an Activity.
 */
const activitySchema = new Schema({
  // The type of activity (e.g., Photo Upload, New Comment, User Registration, etc.)
  activity_type: {
    type: String,
    required: true,
    enum: ['Photo Upload', 'New Comment', 'User Registration', 'User Login', 'User Logout'],
  },
  // The user who performed the activity.
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // The photo related to the activity (if applicable).
  photo_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Photo' 
  },
  // Additional information related to the activity (e.g., comment text).
  additional_info: {
    type: String,
  },
  // The date and time when the activity occurred.
  date_time: { 
    type: Date, 
    default: Date.now 
  },
});

/**
 * Create a Mongoose Model for an Activity using the activitySchema.
 */
const Activity = mongoose.model("Activity", activitySchema);

/**
 * Make this available to our application.
 */
module.exports = Activity;
