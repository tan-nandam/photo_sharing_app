/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const logActivity = require('./activityLogger.js');
// const async = require("async");

const express = require("express");
const app = express();
const http = require('http');
const socketIO = require('socket.io');

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Initialize Socket.IO with the server
const io = socketIO(server);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A client connected');
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Load the Mongoose schema for User, Photo, and SchemaInfo


const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const { makePasswordEntry, doesPasswordMatch } = require("./saltPassword");

const storage = multer.memoryStorage(); // Use memory storage to store files temporarily
const upload = multer({ storage });

const imagesDir = path.join(__dirname, 'images');

const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const Activity = require("./schema/activity.js");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(session({secret: "secretKeyTan", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true })); // For parsing FormData fields
app.use(express.json()); // For parsing JSON payloads

app.post("/admin/login", async (request, response) => {
  //console.log("session id:", request.session.id);
  const { login_name, password } = request.body; // Extract login_name from the request body
  //console.log(login_name, password);
  try {
      const user = await User.findOne({ login_name }); // Check if user exists
      if (!user || !doesPasswordMatch(user.password_digest, user.salt, password)) {
        return response.status(400).send("Invalid login credentials.");
      }
      else if (user) {
          request.session.userId = user._id; // Store user ID in session
          logActivity(io,'User Login', request.session.userId);
          return response.status(200).json({
              _id: user._id,
              first_name: user.first_name,
              login_name: user.login_name
          });
      } else {
          return response.status(400).send("Invalid user");
      }
      
  } catch (error) {
      console.error("Error during login:", error);
      return response.status(500).send("Server error");
  }
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

// middleware for filtered photos according to visibility.
const filterVisiblePhotos = async (req, res, next) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send("Unauthorized: User not logged in");
  }

  try {
    // Fetch photos based on visibility settings and visibility toggle
    const photos = await Photo.find({
      $or: [
        // Case 1: Visibility toggle is false, the photo is visible to everyone (public)
        { visibilityToggle: false },

        // Case 2: Visibility toggle is true and the list is empty, only the owner can view
        { visibilityToggle: true, visibility: { $size: 0 }, user_id: userId },

        // Case 3: Visibility toggle is true and the user is in the visibility list
        { visibilityToggle: true, visibility: userId },
       
        // Case 4: If visibilityToggle is not present, assume it is public (show it to all users)
        { visibilityToggle: { $exists: false } }
      ]
    });

    req.filteredPhotos = photos;
    //console.log("req.filteredPhotos",req.filteredPhotos);
    next();
  } catch (err) {
    console.error("Error filtering photos:", err);
    res.status(500).send("Server error");
  }
};


app.get("/", isAuthenticated, function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

// New API to fetch the logged-in user details
app.get("/admin/current-user", isAuthenticated, async (request, response) => {
  try {
    // Fetch the userId from the session
    const userId = request.session.userId;
    // Fetch the user from the database using the userId
    const user = await User.findById(userId, '_id first_name last_name login_name favorites');
    
    if (!user) {
      return response.status(404).send("User not found");
    }
    
    return response.status(200).json(user); // Return the user details
  } catch (error) {
    console.error("Error fetching current user:", error);
    return response.status(500).send("Server error");
  }
});

app.post("/admin/logout", (request, response) => {
  logActivity(io,'User Logout', request.session.userId);
  // Destroy the session to log out the user
  request.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return response.status(500).send("Server error");
    }
    
    response.clearCookie("connect.sid", { path: "/" });
    // Send a success response
    
    return response.status(200).send("Logged out successfully");
  });
});

app.get('/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ date_time: -1 }).limit(5); // Fetch the latest activities
    const activityDetails = await Promise.all(activities.map(async (act) => {
      let additionalInfo = {}; // We'll store extra info here based on activity type

      // For Photo Upload or New Comment activity type, fetch photo details
      if (act.activity_type === "Photo Upload" || act.activity_type === "New Comment") {
        const photo = await Photo.findById(act.photo_id);
        additionalInfo.photoFileName = photo ? photo.file_name : null; // Add the photo file name
      }
      // For Login, Logout, or Registration, fetch user details
      else if (["User Login", "User Logout", "User Registration"].includes(act.activity_type)) {
        const user = await User.findById(act.user_id);
        additionalInfo.userName = user ? user.first_name : "Unknown"; // Add the user first name
      }

      return { ...act.toObject(), ...additionalInfo }; // Merge the original activity data with additional info
    }));

    return res.status(200).json(activityDetails);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
});



app.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const { comment } = req.body; // Get the comment from the request body
  const { photo_id } = req.params; // Get the photo ID from the route parameters

  // Check if the comment is empty
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "Comment cannot be empty." }); // Respond with a 400 Bad Request if the comment is empty
  }

  try {
    // Assuming session.userId is available and contains the ID of the logged-in user
    const userId = req.session.userId;
    
    // Find the photo by ID and add the comment
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found." }); // Respond with 404 if the photo doesn't exist
    }
    
    // Create a new comment object
    const newComment = {
      _id: new mongoose.Types.ObjectId(), // Generate a unique ID manually
      comment,                            // Comment text
      user_id: userId,                    // Logged-in user's ID
      date_time: new Date(), 
    };

    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;

    let match;
    while ((match = mentionRegex.exec(comment)) !== null) {
      const displayName = match[1]; // "Ellen"
      const userId = match[2];     // "674d3174d18b9d7308b30f8c"
      photo.mention_name.push({
        comment_id: newComment._id, // Use the same comment ID
        user_id: userId,
      });
      //console.log("useridddd", userId);
    }


    // Add the new comment to the photo's comments array
    photo.comments.push(newComment);
    await photo.save(); // Save the updated photo document
    logActivity(io,'New Comment', req.session.userId, { photo_id: photo._id });
    return res.status(200).json(photo); // Respond with the updated photo document

  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Server error." }); // Respond with 500 for server errors
  }
});

app.post('/photos/new', upload.single('uploadedphoto'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }

  const timestamp = new Date().valueOf();
  const filename = `U${timestamp}-${req.file.originalname}`;
  const filePath = path.join(imagesDir, filename);

  // Retrieve visibility from the request body
  const { visibleTo, visibilityEnabled } = req.body;
  const visibilityArray = visibleTo ? JSON.parse(visibleTo) : [];
  const visibilityToggle = visibilityEnabled === 'true'; // Ensure proper boolean conversion

  try {
    // Write the file to the images directory
    await fs.promises.writeFile(filePath, req.file.buffer);

    // Create a new Photo object
    const newPhoto = {
      file_name: filename,
      user_id: req.session.userId, // Assuming you have user info in the request
      date_time: new Date(),
      visibility: visibilityToggle
        ? visibilityArray.map((userId) => new mongoose.Types.ObjectId(userId))
        : [], // Set visibility only if enabled
      visibilityToggle, // Save the toggle status
    };

    // Save the photo in the database
    const photo = await Photo.create(newPhoto);

    // Log the activity
    logActivity(io,'Photo Upload', req.session.userId, { photo_id: photo._id });
    return res.status(201).send(photo); // Return the created photo
  } catch (error) {
    console.error('Error saving photo:', error);
    return res.status(500).send({ error: 'Failed to save photo' });
  }
});


app.post("/user", async (req, res) => {
  const { login_name, first_name, last_name, location, description, occupation, password } = req.body;

  if (!login_name || !first_name || !last_name || !password) {
    return res.status(400).send("Missing required fields.");
  }

  // Check if the user exists
  const existingUser = await User.findOne({ login_name });

  if (existingUser) {
    // If the user exists and has no password, allow them to set a password
    if (!existingUser.password_digest) {
      const { salt, hash } = makePasswordEntry(password);

      // Update the user's password
      existingUser.password_digest = hash;
      existingUser.salt = salt;
      await existingUser.save();

      logActivity(io, 'Password Created', existingUser._id);
      return res.status(200).send({ login_name: existingUser.login_name });
    }

    // If the user already has a password, return a message to log in
    return res.status(400).send("User already exists with a password. Please log in.");
  }

  // If the user doesn't exist, create a new user with the password
  const { salt, hash } = makePasswordEntry(password);

  const newUser = new User({
    login_name,
    first_name,
    last_name,
    location,
    description,
    occupation,
    password_digest: hash,
    salt,
  });

  await newUser.save();
  logActivity(io, 'User Registration', newUser._id);
  return res.status(200).send({ login_name: newUser.login_name });
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  //console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

        const info = await SchemaInfo.find({});
        if (info.length === 0) {
              // No SchemaInfo found - return 500 error
              return response.status(500).send("Missing SchemaInfo");
        }
        //console.log("SchemaInfo", info[0]);
        return response.json(info[0]); // Use `json()` to send JSON responses
      } catch(err){
        // Handle any errors that occurred during the query
        console.error("Error in /test/info:", err);
        return response.status(500).json(err); // Send the error as JSON
      }

  } else if (param === "counts") {
    // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.

    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];

    try {
      await Promise.all(
        collections.map(async (col) => {
          col.count = await col.collection.countDocuments({});
          return col;
        })
      );
  
      const obj = {};
      for (let i = 0; i < collections.length; i++) {
        obj[collections[i].name] = collections[i].count;
      }
      return response.end(JSON.stringify(obj));
    } catch (err) {
      return response.status(500).send(JSON.stringify(err));
    }
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list",isAuthenticated, async function (request, response) {
  // response.status(200).send(models.userListModel());
  try{

    const info = await User.find({}, '_id first_name last_name');
    if (info.length === 0) {
          // No SchemaInfo found - return 500 error
          return response.status(500).send("Missing Users");
    }
    return response.status(200).send(info); // Use `json()` to send JSON responses
  } catch(err){
    // Handle any errors that occurred during the query
    console.error("Error in /user/list", err);
    return response.status(500).json(err); // Send the error as JSON
  }

  

});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", isAuthenticated, async function (request, response) {
  const id = request.params.id;
  try{

    const user = await User.findById(id,'_id first_name last_name location description occupation');
    if (user === null) {
      //console.log("User with _id:" + id + " not found.");
      response.status(400).send("Not found");
      return;
    }
    response.status(200).send(user); // Use `json()` to send JSON responses
  } catch(err){
    // Handle any errors that occurred during the query
    console.error("Error in /user/:id", err);
    response.status(400).json(err); // Send the error as JSON
  }
  
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", isAuthenticated, filterVisiblePhotos, async function (request, response) {
  //console.log("filtered photos yayy", request.filteredPhotos);
  const id = request.params.id;
  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).send({ error: "Invalid user ID format" });
  }
  try{
    //const photos = await Photo.find({user_id: id},'id user_id comments file_name date_time');

    const filteredPhotoIds = request.filteredPhotos.map((photo) => photo._id);
    //console.log("filteredPhotoIds", filteredPhotoIds);

    // Fetch photos that match the filtered IDs and belong to the user
    const photos = await Photo.find(
      { user_id: id, _id: { $in: filteredPhotoIds } }, // Use $in operator for filtering
      'id user_id comments file_name date_time likeCount'
    );
    
    const users = await User.find({}, '_id first_name last_name');
    const transformedPhotos = photos.map((photo) => ({
      ...photo.toObject(), // Ensure Mongoose documents are plain objects
      comments: photo.comments.map((cmt) => ({
        comment: cmt.comment,
        date_time: cmt.date_time,
        _id: cmt._id,
        user: users.find(u => u._id.equals(cmt.user_id)) || null, // Add user object to each comment
      }))
    }));
    
    
    if (!photos || photos.length === 0) {
      //console.log("Photos for user with _id:" + id + " not found.");
      return response.status(400).send("Not found");
      
    }
    return response.status(200).send(transformedPhotos);
  }catch(err){
    console.error("Error in /photosOfUser/:id", err);
    return response.status(400).json(err);
  }
  });

/**
 * URL /photosOfUser/:userId/:photoId - returns the photo for each photoId of a user (id).
 */
app.get("/photosOfUser/:userId/:photoId", isAuthenticated,async function(request, response){
    const pId = request.params.photoId;
    const userId = request.params.userId;
    const photo = await Photo.find({user_id: userId, _id:pId});
  
    if(photo){
      return response.status(200).send(photo);
    }else{
      return response.status(400).send("Photo not found");
    }
    
  
});

/**
* URL /recentPhotoOfUser/:id - returns the recent photo of a user (id).
*/
app.get("/recentPhotoOfUser/:id", isAuthenticated, filterVisiblePhotos, async function(request,response){

  const id = request.params.id;
  //console.log(id);
  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).send({ error: "Invalid user ID format" });
  }
  try{
    const filteredPhotoIds = request.filteredPhotos.map((photo) => photo._id);
    //console.log("filteredPhotoIds", filteredPhotoIds);

    // Fetch photos that match the filtered IDs and belong to the user
    const photos = await Photo.find(
      { user_id: id, _id: { $in: filteredPhotoIds } }, // Use $in operator for filtering
      'id file_name date_time'
    );
    
    if(photos && photos.length>0){
      const recentPhoto = photos[photos.length-1];
      return response.status(200).json(recentPhoto);
    }
    else{
      return response.status(200).json("No photos found");
    }
  }catch(err){
    console.error("Error in /recentPhotoOfUser/:id", err);
    return response.status(400).json(err);
  }
})

/**
* URL /highlyCommentedPhoto/:id - returns the recent photo of a user (id).
*/
app.get("/highlyCommentedPhoto/:id", isAuthenticated, filterVisiblePhotos,async function(request,response){

 const userId = request.params.id;
 try{
  const filteredPhotoIds = request.filteredPhotos.map((photo) => photo._id);
    //console.log("filteredPhotoIds", filteredPhotoIds);

    // Fetch photos that match the filtered IDs and belong to the user
    const photos = await Photo.find(
      { user_id: userId, _id: { $in: filteredPhotoIds } } // Use $in operator for filtering
    );
 const filteredPhotos = photos.filter(photo => photo.comments.length > 0);

 if(filteredPhotos.length>0){
    const photoWithMaxComments = photos.reduce((maxPhoto, currPhoto)=>{
     return currPhoto.comments.length > (maxPhoto.comments?.length || 0) ? currPhoto : maxPhoto;
    }, {});
    
    return response.status(200).send(photoWithMaxComments);
}else{
  return response.status(200).send("No photos with comments found");
}
} catch(err){
  console.error("Error in /highlyCommentedPhoto/:id", err);
  return response.status(400).json(err);
}

}
)


/**
* URL /mentionsOfUser/:userId - returns the recent photo of a user (id).
*/
app.get("/mentionsOfUser/:userId", isAuthenticated, filterVisiblePhotos, async function(request, response){

  const userId = request.params.userId;
  try{
    const filteredPhotoIds = request.filteredPhotos.map((photo) => photo._id);
    
    // Fetch photos that match the filtered IDs and mention the user
    const photos = await Photo.find({
      $and: [
        { _id: { $in: filteredPhotoIds } }, // Filter photos by filtered IDs
        { "mention_name.user_id": userId  } // Only photos that mention the user
      ]
    }).populate('user_id', 'first_name'); // Populate first_name for user_id
    return response.status(200).send(photos);
  }catch(err){
    console.error('Error fetching photos:', err);
    return response.status(400).json(err);
  }
})

app.delete("/delete/:action", isAuthenticated, async function (request, response) {
  const { action } = request.params; // "photo" or "comment"
  const { id } = request.body; // The ID of the photo or comment
  const userId = request.session.userId; // Logged-in user's ID

  try {
    if (!id) {
      return response.status(400).send({ message: "ID is required." });
    }

    if (action === "photo") {
      // Delete a photo
      const photo = await Photo.findOne({ _id: id, user_id: userId });
      if (!photo) {
        return response.status(404).send({ message: "Photo not found or unauthorized." });
      }

      // Delete the photo
      await Photo.deleteOne({ _id: id });

      return response.send({ message: "Photo deleted successfully." });
    } else if (action === "comment") {
      // Delete a comment
      const photo = await Photo.findOne({ "comments._id": id, "comments.user_id": userId });
      if (!photo) {
        return response.status(404).send({ message: "Comment not found or unauthorized." });
      }

      // Remove the comment
      await Photo.updateOne(
        { "comments._id": id },
        { $pull: { comments: { _id: id } } }
      );

      const comment = photo.comments.find(comment => comment._id.toString() === id);
      const commentText = comment.comment; // Assuming the text field contains the comment

      // Use regex to extract the user ID from the comment
      const mentionRegex = /\@\[[^\]]+\]\((.*?)\)/; // Updated regex to correctly match @[Name](user_id)
      const match = commentText.match(mentionRegex);
      const mentionedUserId = match ? match[1] : null;

      if (mentionedUserId && comment._id) {
        await Photo.updateOne(
          { _id: photo._id },
          { $pull: { mention_name: {
            user_id: mentionedUserId, // Match the user_id
            comment_id: comment._id,   // Match the comment_id
           } }
          }
        );
      }
      
      return response.send({ message: "Comment deleted successfully." });
    } else {
      return response.status(400).send({ message: "Invalid action. Must be 'photo' or 'comment'." });
    }
  } catch (error) {
    console.error("Error in delete API:", error);
    return response.status(500).send({ message: "An error occurred. Please try again later." });
  }
});


// Delete User API
app.delete("/delete-account/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Step 1: Delete the user
    await User.findByIdAndDelete(userId);

    // Step 2: Delete all photos uploaded by the user
    await Photo.deleteMany({ user_id: userId });

    // Step 3: Remove comments made by the user from all photos
    await Photo.updateMany(
      {},
      { $pull: { comments: { user_id: new mongoose.Types.ObjectId(userId) } } } // Correctly instantiate ObjectId
    );

    await Activity.deleteMany({ user_id: userId });

    res.status(200).send({ message: "User and associated data deleted successfully." });
  } catch (error) {
    console.error("Error deleting user and data:", error);
    res.status(500).send({ error: "Failed to delete user and associated data." });
  }
});

app.post("/photos/:photoID/like", async (req, res) => {
  try {
    const photoID = req.params.photoID;
    const userID = req.session.userId; // Assuming session userId is set

    if (!userID) {
      return res.status(401).send({ message: "User not logged in" });
    }

    const photo = await Photo.findOne({ _id: photoID });

    if (!photo) {
      return res.status(404).send({ message: "Photo not found" });
    }

    // Check if user has already liked the photo
    const userHasLiked = photo.likedBy.includes(userID);


    console.log("likecount before:", photo);
    if (userHasLiked) {
      // User already liked, so unlike the photo
      photo.likeCount -= 1;
      photo.likedBy = photo.likedBy.filter((id) => id.toString() !== userID.toString());
    } else {
      // User has not liked, so like the photo
      photo.likeCount += 1;
      photo.likedBy.push(userID);
    }
    console.log("likecount after:", photo);
    // Save the updated photo
    await photo.save();

    // Send updated data to the UI
    res.status(200).send({
      likeCount: photo.likeCount,
      likedBy: photo.likedBy,
      likedByUser: !userHasLiked, // Send the updated status
    });
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).send({ message: "An error occurred while liking the photo" });
  }
});

app.post("/favorites/add", async (req, res) => {
  const { userId, photoId } = req.body;
  console.log("useridddddd",userId);
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: photoId } }, // Adds photoId, avoids duplicates
      { new: true } // Returns the updated user document
    );

    res.status(200).json(user.favorites); // Send updated favorites to the frontend
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).send("Failed to add to favorites.");
  }
});

app.post("/favorites/remove", async (req, res) => {
  const { userId, photoId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: photoId } }, // Removes the photoId
      { new: true } // Returns the updated user document
    );

    res.status(200).json(user.favorites); // Send updated favorites to the frontend
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).send("Failed to remove from favorites.");
  }
});

app.get("/favorites/:userId", async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a query parameter

  try {
    // Find the user and populate their favorite photos
    const user = await User.findById(userId).populate("favorites"); // Assuming favorites are photo references

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(user.favorites); // Return the list of favorited photos
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).send("Failed to fetch favorites.");
  }
});

app.get("/sidebar/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all activities for the given user
    const activities = await Activity.find({ user_id: userId });

    if (!activities || activities.length === 0) {
      return res.status(200).json([]);
    }

    // Sort activities by `date_time` in descending order
    const sortedActivities = activities.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

    // Enhance activities with thumbnails for "posted a photo"
    const detailedActivities = await Promise.all(
      sortedActivities.map(async (activity) => {
        if (activity.activity_type === "Photo Upload") {
          const photo = await Photo.findById(activity.photo_id); // Assuming `photo_id` exists in activity
          return {
            ...activity.toObject(),
            thumbnail: photo ? photo.file_name : null, // Include thumbnail if available
          };
        }
        return activity;
      })
    );
    

    res.status(200).json(detailedActivities);
  // // Emit real-time updates for the most recent activity
  // if (detailedActivities.length > 0) {
  //   const mostRecentActivity = detailedActivities[0];
  //   io.emit("sidebarUpdate", { userId, activity: mostRecentActivity });
  // }
} catch (error) {
  console.error("Error fetching user activities: ", error);
  res.status(500).send("Failed to fetch user activities");
}
});



module.exports = app;



server.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
