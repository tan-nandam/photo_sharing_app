import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Button, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Avatar } from "@mui/material";
import axios from "axios";
import CommentSection from "../CommentSection";
import ImageDisplay from "../ImageDisplay";
import { MentionsInput, Mention } from "react-mentions";
import defaultStyle from "./defaultStyle";
import DeleteIcon from '@mui/icons-material/Delete'; // Add delete icon
import CommentIcon from '@mui/icons-material/Comment';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import FavoriteIcon from '@mui/icons-material/Favorite'; // Heart icon for likes


function PhotoViewer({ idx, parray, formatDateToWords, updatePhotoComments, userId }) {
  const navigate = useNavigate();
  const photo = parray[idx];
  const [mappedUserData, setMappedUserData] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);  // State for invalid user mentions
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // Confirmation dialog state
  const [likeCount, setLikeCount] = useState(photo?.likeCount || 0);
  const [likedByUser, setLikedByUser] = useState(photo?.likedByUser || false);
  const [likedByUsers, setLikedByUsers] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, currentUserResponse, photoResponse] = await Promise.all([
          axios.get("http://localhost:3000/user/list"),
          axios.get("http://localhost:3000/admin/current-user", { withCredentials: true }),
          axios.get(`http://localhost:3000/photosOfUser/${userId}/${photo._id}`),
        ]);
  
        const users = usersResponse?.data || [];
        const mappedData = users.map(user => ({
          id: user._id,
          display: user.first_name,
        }));
        setMappedUserData(mappedData);
  
        setLoggedInUser(currentUserResponse?.data._id);
        
        const fetchedPhoto = photoResponse?.data[0];
        setLikeCount(fetchedPhoto.likeCount);
        setLikedByUser(fetchedPhoto.likedBy.includes(currentUserResponse?.data._id));
        setIsFavorited((currentUserResponse?.data.favorites).includes(fetchedPhoto._id));
  
        const likedUserNames = fetchedPhoto.likedBy
          .map(userId => {
            const user = mappedData.find(user => user.id === userId);
            return user?.display;
          })
          .filter(Boolean);
  
        console.log("Users who liked this photo:", likedUserNames);
        setLikedByUsers(likedUserNames);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [photo._id]);
  
  

  const toggleLike = async () => {
    try {
      const response = await axios.post(`/photos/${photo._id}/like`, null, { withCredentials: true });
      setLikeCount(response.data.likeCount);
      setLikedByUser(response.data.likedByUser);
      setLikedByUsers(response.data.likedBy.map(userId => {
        const user = mappedUserData.find(user => user.id === userId);
        console.log("meoww", user);
        return user?.display;
      }));
    } catch (error) {
      console.error("Error updating like:", error);
      alert("Failed to update like status.");
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await axios.delete("/delete/photo", {
        data: { id: photoId }, // Send the photo ID in the body of the request
        withCredentials: true, // Ensure that cookies are included for session-based authentication
      });
      console.log(response.data.message); // Success message
      window.location.reload();
      // Optionally, update the UI after deletion, like removing the photo from state
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert(error.response ? error.response.data.message : "An error occurred while deleting the photo.");
    }
  };

  
  const handleClick = (event, id) => {
    event.preventDefault();
    navigate(`/users/${id}`);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUserNotFound(false);  // Reset error message when closing the dialog
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") return; // Don't submit empty comments
    if (userNotFound) {
      // Don't submit the comment if user mention is invalid
      return;
    }
    const commentData = { comment: newComment };


    try {
      const response = await axios.post(`/commentsOfPhoto/${photo._id}`, commentData);
      const updatedPhoto = response.data; // Get the updated photo data from the server
      updatePhotoComments(updatedPhoto); // Update the photo comments in the parent component
      setNewComment(""); // Clear the input field
    } catch (error) {
      alert(error.response ? error.response.data.message : "An error occurred while adding the comment.");
    }

    handleCloseDialog(); // Close the dialog
  };

  // Function to check if there are any invalid mentions
  const checkValidMentions = (commentText) => {
    const mentions = commentText.match(/@([a-zA-Z0-9_]+)/g); // Find all mentions, e.g., @username
    if (mentions) {
      for (const mention of mentions) {
        const username = mention.slice(1);  // Remove the "@" symbol
        const validUser = mappedUserData.find(user => user.display.toLowerCase() === username.toLowerCase());
        if (!validUser) {
          setUserNotFound(true); // Set error if invalid user is mentioned
          return;
        }

      }
    }
    setUserNotFound(false); // Reset error if all mentions are valid
  };

  const handleFavoriteToggle = async () => {
    try {
      // API request to add/remove photo from user's favorites
      if (isFavorited) {
        // Remove from favorites
        await axios.post("/favorites/remove", { userId: loggedInUser, photoId: photo._id });
        setIsFavorited(false);
      } else {
        // Add to favorites
        console.log("loggedInUser",loggedInUser);
        await axios.post("/favorites/add", { userId: loggedInUser, photoId: photo._id });
        setIsFavorited(true);
      }
  
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };
  

  return (
    <Paper elevation={3} style={{ margin: "20px auto", padding: "20px", maxWidth: "600px" }}>
      <ImageDisplay src={`../../images/${photo?.file_name}`} alt="User" date={formatDateToWords(photo.date_time)} />
      <Divider style={{ margin: "20px 0" }} />

        {/* Flex Container for the Icons and Counts */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
    {/* Like Section with Heart Icon */}
    <div style={{ display: "flex", alignItems: "center" }}>
      <Tooltip title={likedByUsers.join(", ") || "No likes yet"}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", cursor: "pointer" }}>
          <FavoriteIcon
            style={{ fontSize: "30px", color: likedByUser ? "red" : "gray", marginRight: "8px" }}
            onClick={toggleLike}
          />
          <span style={{ fontSize: "16px", fontWeight: "bold", color: "gray" }}>
            {likeCount === 1 ? "1 Like" : `${likeCount} Likes`}
          </span>
        </div>
      </Tooltip>
    </div>

    <div style={{ display: "flex", alignItems: "center" }}>
    <Tooltip title={isFavorited ? "Unfavorite Photo" : "Favorite Photo"}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
      onClick={handleFavoriteToggle}
    >
      <BookmarksIcon
        style={{
          fontSize: "30px",
          color: isFavorited ? "#FFD700" : "gray",
          marginRight: "8px",
        }}
      />
      <span style={{ fontSize: "16px", fontWeight: "bold", color: "gray" }}>
        {isFavorited ? "Favorited" : "Favorite"}
      </span>
    </div>
  </Tooltip>
    </div>

    {/* Comments Section with Comment Icon */}
    <div style={{ display: "flex", alignItems: "center" }}>
      <Tooltip title="Comments">
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <CommentIcon style={{ fontSize: "30px", marginRight: "8px" }} />
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            {photo.comments.length === 1 ? "1 Comment" : `${photo.comments.length} Comments`}
          </span>
        </div>
      </Tooltip>
    </div>
  </div>

      <CommentSection comments={photo.comments} handleClick={handleClick} loggedInUser={loggedInUser} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
      <Button
      variant="contained"
      color="secondary" 
      onClick={handleOpenDialog}
      style={{
        marginTop: "20px",
        backgroundColor: "#FF5722",  // Orange color
        color: "#fff",  // White text color
      }}
      startIcon={<CommentIcon />} // Adding the comment icon
    >
      Add Comment
    </Button>
      {photo?.user_id === loggedInUser && (
          <Button
            variant="contained"
            color="error"
            style={{ marginTop: "20px" }}
            onClick={() => setConfirmDialogOpen(true)}
            startIcon={<DeleteIcon />}
          >
            Delete Photo
          </Button>
        )}
      </div>
      {/* Dialog for adding comments */}
      <Dialog open={openDialog} onClose={handleCloseDialog}  fullWidth={true} maxWidth={false} sx={{ "& .MuiDialog-paper": { width: "50%", maxWidth: "600px" } }}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <MentionsInput
            value={newComment}
            onChange={(e) => {
              const value = e.target.value;
              setNewComment(value);
              checkValidMentions(value);  // Check for valid mentions whenever the comment changes
            }}
            style={defaultStyle}
            placeholder="Add a comment..."
          >
            <Mention
              trigger="@"
              data={mappedUserData}
              style={{ backgroundColor: "#daf4fa" }}
            />
          </MentionsInput>
          {userNotFound && (
            <Typography variant="body2" color="error" style={{ marginTop: "10px" }}>
              User not found
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleCommentSubmit} color="primary"  disabled={userNotFound}>Submit</Button>
        </DialogActions>
      </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this photo? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary">Cancel</Button>
          <Button onClick={() => handleDeletePhoto(photo?._id)} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default PhotoViewer;
