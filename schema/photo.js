"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
const commentSchema = new mongoose.Schema({
  // The text of the comment.
  comment: String,
  // The date and time when the comment was created.
  date_time: { type: Date, default: Date.now },
  // The ID of the user who created the comment.
  user_id: mongoose.Schema.Types.ObjectId,
});

/**
 * Define the Mongoose Schema for a Photo.
 */
const photoSchema = new mongoose.Schema({
  // Name of the file containing the photo (in the project6/images directory).
  file_name: String,
  // The date and time when the photo was added to the database.
  date_time: { type: Date, default: Date.now },
  // The ID of the user who created the photo.
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Array of comment objects representing the comments made on this photo.
  comments: [commentSchema],
  mention_name : [
    {
      comment_id: mongoose.Schema.Types.ObjectId, // Individual field for comment_id
      user_id: String, // Individual field for user_id
    }
  ],
  visibility : [mongoose.Schema.Types.ObjectId],
  visibilityToggle : Boolean,
  likeCount : { type: Number, default: 0 },
  likedBy : [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

/**
 * Create a Mongoose Model for a Photo using the photoSchema.
 */
const Photo = mongoose.model("Photo", photoSchema);

/**
 * Make this available to our application.
 */
module.exports = Photo;
