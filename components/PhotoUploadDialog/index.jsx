import React, { useRef, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, FormControlLabel, Box, IconButton, Typography, Snackbar } from "@mui/material";
import { CloudUpload as CloudUploadIcon, Cancel as CancelIcon, Favorite as FavoriteIcon } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";

// Styled components for the custom upload button
const UploadButton = styled('label')({
  backgroundColor: "#2196F3", // Blue background
  color: "#fff",
  borderRadius: "50%",
  width: "60px", // Smaller button size
  height: "60px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  border: "none",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
  "&:hover": {
    backgroundColor: "#1976D2", // Darker blue on hover
  },
});

const UploadIcon = styled(CloudUploadIcon)({
  fontSize: "30px", // Smaller icon size
});

const ThumbnailContainer = styled('div')({
  display: "flex",
  alignItems: "center",
  marginLeft: "20px", // Space between upload icon and thumbnail
});

const Thumbnail = styled('img')({
  width: "60px",
  height: "60px",
  objectFit: "cover",
  marginRight: "10px",
  borderRadius: "5px",
});

const RemoveThumbnail = styled(CancelIcon)({
  cursor: "pointer",
  color: "red",
});

const UserSelectContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "10px",
  gap: "10px", // Add gap between the user items
  maxHeight: "50%", // Limit the height of the user select area to half the modal
  overflowY: "hidden", // Disable scrolling
});

const UserSelect = styled(Box)(({ selected, isCurrentUser }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: isCurrentUser ? "default" : "pointer", // Prevent cursor change for the current user
  fontSize: "22px", // Larger text for better readability
  color: selected ? "#ff4081" : "#000", // Red when selected, default black
  transition: isCurrentUser ? "none" : "transform 0.2s ease-in-out", // No animation for current user
  "&:hover": !isCurrentUser && {
    transform: "scale(1.1)", // Smooth scale-up on hover for non-current users
    color: "#1976D2", // Change color on hover
  },
  "& svg": {
    marginRight: "5px", // Space between icon and name
  },
}));

const HeartMessage = styled(Typography)({
  textAlign: "center",
  fontSize: "20px", // Slightly bigger text for the heart message
  marginBottom: "10px",
  fontWeight: "bold",
  color: "#2196F3",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  "& svg": {
    marginRight: "8px", // Space between heart and text
  },
});

function PhotoUploadDialog({ open, onClose, showSnackbar, setParray, id }) {
  const uploadInputRef = useRef(null); // Reference to the file input
  const navigate = useNavigate();
  const [visibilityEnabled, setVisibilityEnabled] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // Store the selected file
  const [fileName, setFileName] = useState(""); // Store the file name
  const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State to control Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message state

  useEffect(() => {
    if (visibilityEnabled) {
      // Fetch users and set logged-in user
      Promise.all([axios.get('/user/list')])
        .then(([usersResponse]) => {
          const fetchedUsers = usersResponse.data;
          setUsers(fetchedUsers);
          // Assuming 'id' is the logged-in user's ID
          const loggedInUser = fetchedUsers.find((user) => user._id === id);
          setLoggedInUser(loggedInUser);
          setSelectedUsers([loggedInUser?._id]); // Select the logged-in user by default
        })
        .catch((error) => {
          console.error("Error in fetching data:", error);
        });
    }
  }, [visibilityEnabled, id]);

  const handleUploadSuccess = (newPhoto) => {
    setParray((prevArray) => [...prevArray, newPhoto]); // Add new photo to the existing array
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the file
    if (file) {
      setSelectedFile(URL.createObjectURL(file)); // Create a URL for the file preview
      setFileName(file.name); // Set the file name
    }
  };

  const handleRemoveThumbnail = () => {
    setSelectedFile(null);
    setFileName("");
    setVisibilityEnabled(false); // Reset visibility state
    setSelectedUsers([loggedInUser?._id]); // Reset to select logged-in user by default
     // Reset the file input
    if (uploadInputRef.current) {
      uploadInputRef.current.value = ""; // Reset the file input value
    }
  };

  const handleUploadButtonClicked = async (e) => {
    e.preventDefault();
    const file = uploadInputRef.current.files[0]; // Get the file from the input

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("uploadedphoto", file); // Append the file to form data
    formData.append("visibleTo", JSON.stringify(selectedUsers));
    formData.append("visibilityEnabled", visibilityEnabled);

    try {
      const response = await axios.post('/photos/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Photo uploaded successfully:", response.data);
      handleUploadSuccess(response.data); // Call handleUploadSuccess with the new photo data
      setSnackbarMessage("💖 Photo uploaded successfully! 💖"); // Set success message for snackbar
      setSnackbarOpen(true); // Show Snackbar
      navigate(`/users/${id}`);
      window.location.reload();
      onClose(); // Close the dialog after uploading
    } catch (error) {
      alert(`Upload failed: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  const handleClose = () => {
    // Reset states when the modal is closed
    setSelectedFile(null);
    setFileName("");
    setVisibilityEnabled(false);
    setSelectedUsers([loggedInUser?._id]); // Re-select the logged-in user by default
    onClose(); // Close the modal
  };

  const handleUserSelect = (userId) => {
    if (userId === loggedInUser?._id) return; // Do not allow deselecting the logged-in user
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId); // Remove user
      } else {
        return [...prevSelected, userId]; // Add user
      }
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Close Snackbar
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Photo</DialogTitle>
        <DialogContent>
          {/* Flexbox container for upload icon, file name, and restrict visibility */}
          <Box display="flex" alignItems="center" mb={2}>
            <UploadButton htmlFor="file-upload">
              <UploadIcon />
            </UploadButton>
            <input
              type="file"
              accept="image/*"
              ref={uploadInputRef}
              id="file-upload"
              style={{ display: "none" }}
              onChange={handleFileChange} // Handle file selection
            />
            <ThumbnailContainer>
              {/* Thumbnail will only appear if a file is selected */}
              {selectedFile && (
                <>
                  <Thumbnail src={selectedFile} alt="Selected file" />
                  <div>
                    <p>{fileName}</p>
                    <RemoveThumbnail onClick={handleRemoveThumbnail} />
                  </div>
                </>
              )}
            </ThumbnailContainer>
            <FormControlLabel
              control={<Switch checked={visibilityEnabled} onChange={() => setVisibilityEnabled(!visibilityEnabled)} />}
              label="Restrict Visibility"
              style={{ marginLeft: "auto" }} // Align to the right
            />
          </Box>

          {/* Lovely message */}
          {visibilityEnabled && loggedInUser && (
            <HeartMessage>
              Select your friends from the heart of our users!
            </HeartMessage>
          )}

          {/* User Selection - Display users in multiple lines, only taking half the modal */}
          {visibilityEnabled && loggedInUser && (
            <UserSelectContainer>
              {users.map((user) => (
                <UserSelect
                  key={user._id}
                  selected={selectedUsers.includes(user._id)}
                  onClick={() => handleUserSelect(user._id)}
                  isCurrentUser={user._id === loggedInUser._id}
                >
                  <FavoriteIcon
                    style={{
                      fontSize: "20px", // Smaller heart size
                      color: user._id === loggedInUser._id ? "#ff4081" : (selectedUsers.includes(user._id) ? "#ff4081" : "#ddd"), // Red for selected or logged-in user
                      transition: "color 0.3s ease, transform 0.2s ease", // Smooth color transition and animation
                      transform: selectedUsers.includes(user._id) ? "scale(1.2)" : "scale(1)", // Animation on selection
                    }}
                  />
                  {user.first_name}
                </UserSelect>
              ))}
            </UserSelectContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleUploadButtonClicked}
            disabled={!selectedFile}
            variant="contained"
            color="primary"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for successful upload */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // Snackbar will auto-hide after 6 seconds
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          style: {
            backgroundColor: "#ff4081", // Pink background for "love" theme
            color: "#fff", // White text
            fontWeight: "bold", // Make the text bold
          },
        }}
      />
    </>
  );
}

export default PhotoUploadDialog;
