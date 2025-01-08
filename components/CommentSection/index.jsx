import React, { useState } from "react";
import { Paper, Typography, Button, Snackbar, Avatar, IconButton, Tooltip } from "@mui/material";
import { MentionsInput, Mention } from "react-mentions";
import { formatDateToWords } from "../../utils"; // Utility function for formatting date
import defaultStyle from "../PhotoViewer/defaultStyle";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete'; // Import delete icon
import { blue, red } from '@mui/material/colors';

const CommentSection = ({ comments, handleClick, loggedInUser }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete("/delete/comment", {
        data: { id: commentId }, // Send the comment ID in the body of the request
        withCredentials: true, // Ensure that cookies are included for session-based authentication
      });

      console.log("Hello", response);

      console.log(response.data.message); // Success message
      setSnackbarMessage("Comment deleted successfully!");
      setOpenSnackbar(true); // Show Snackbar
    } catch (error) {
      console.error("Error deleting comment:", error);
      setSnackbarMessage(error.response ? error.response.data.message : "An error occurred while deleting the comment.");
      setOpenSnackbar(true); // Show Snackbar
    }
  };

  return (
    <div>
      <Typography variant="h6" align="left" gutterBottom>
        Comments:
      </Typography>
      {comments && comments.length > 0 ? (
        comments.map((cmt, index) => (
          <Paper key={index} elevation={2} style={{ margin: "10px 0", padding: "15px", position: "relative" }}>
            {/* Use MentionsInput to render mentions */}
            <MentionsInput
              value={cmt.comment || ""} // Raw comment data with mention format
              readOnly
              style={defaultStyle}
            >
              <Mention
                style={{ backgroundColor: "#daf4fa" }}
              />
            </MentionsInput>
            <Typography variant="caption" style={{ display: "block", color: "#616161", marginTop: "5px" }}>
              {formatDateToWords(cmt.date_time)}
            </Typography>

            {/* Custom "Commented by" section with rounded avatar */}
            <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
              <Typography variant="body2" style={{ marginRight: "8px", color: "#616161" }}>
                Commented by
              </Typography>
              <Tooltip title={`View ${cmt?.user?.first_name}'s profile`}>
                <Avatar
                  alt={cmt?.user?.first_name}
                  style={{
                    width: 30,
                    height: 30,
                    marginRight: 8,
                    cursor: "pointer",
                    border: `2px solid ${blue[500]}`,
                    backgroundColor: blue[500],
                    textTransform: 'uppercase', // Makes the text capitalized
                    fontWeight: "bold", // Makes it stand out
                    color: "white",
                  }}
                  onClick={(event) => handleClick(event, cmt?.user?._id)}
                >
                  {cmt?.user?.first_name ? cmt?.user?.first_name[0] : "A"} {/* Shows the first letter of the user's name */}
                </Avatar>
              </Tooltip>
            </div>

            {/* Delete icon button with custom styling */}
            {cmt?.user?._id === loggedInUser && (
              <IconButton
                color="error"
                onClick={() => handleDeleteComment(cmt._id)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "white",
                  border: `2px solid ${red[500]}`,
                  borderRadius: "50%",
                  padding: "5px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                  transition: "background-color 0.3s, color 0.3s, border-color 0.3s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = red[500];
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "white"; // Change border color to white
                  e.currentTarget.querySelector('svg').style.fill = "white"; // Change the delete icon to white
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = red[500];
                  e.currentTarget.style.borderColor = red[500]; // Reset border color to red
                  e.currentTarget.querySelector('svg').style.fill = red[500]; // Reset icon color to red
                }}
              >
                <DeleteIcon style={{ fill: red[500] }} />
              </IconButton>
            )}
          </Paper>
        ))
      ) : (
        <Typography variant="body2" color="textSecondary">
          No comments
        </Typography>
      )}

      {/* Snackbar for delete confirmation */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </div>
  );
};

export default CommentSection;
