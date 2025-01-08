import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Box,
  ListItemIcon 
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import WarningIcon from "@mui/icons-material/Warning";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from "axios";
import PhotoUploadDialog from "../PhotoUploadDialog";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function TopBar({ path, id, user, setUser }) {
  const [fname, setFname] = useState(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [parray, setParray] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/test/info")
      .then((response) => {
        setVersion(response.data.__v);
      })
      .catch((error) => {
        console.error("Failed to fetch version:", error);
      });
  }, []);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:3000/user/${id}`)
        .then((response) => {
          setFname(response.data.first_name);
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
        });
    }
  }, [id]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/admin/logout");
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };


  const goToActivities = () => {
    navigate("/activities");
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

   const goToFavorites = () => {
    navigate("/favorites"); // Navigate to the Favorites page
  };
  
  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`http://localhost:3000/delete-account/${id}`);
      showSnackbar("Account deleted successfully.");
      setUser(null);
      setDeleteDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      showSnackbar("Failed to delete account.");
    }
  };

  return (
    <>
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Grid container justifyContent="space-between" alignItems="center">
          <Box
      sx={{
        position: "relative",
        display: "inline-block",
        cursor: "pointer",
      }}
    >
              {user ? (
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{
                    backgroundColor: "#e3f2fd",
                    padding: "5px 10px",
                    borderRadius: "20px",
                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                  }}
                  onClick={toggleDropdown}
                >
              <Avatar
                sx={{
                  bgcolor: "#1976d2", // Blue background color
                  color: "#fff", // White text color
                  fontWeight: "bold",
                  width: 30,
                  height: 30,
                  marginRight: "10px",
                }}
              >
                {user.first_name.charAt(0).toUpperCase()}
              </Avatar>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#1976d2" }}
                  >
                    Hi, {user.first_name}
                  </Typography>
                </Box>
              ): "Please Login"}

          {dropdownOpen && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      zIndex: 1,
                      backgroundColor: "#f9f9f9", // Soft gray dropdown
                      borderRadius: "8px",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      marginTop: "10px",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      border: "1px solid #e0e0e0", // Subtle border
                    }}
                  >
                    {/* Profile Button */}
                    <Button
                      sx={{
                        justifyContent: "flex-start",
                        padding: "10px 20px",
                        textAlign: "left",
                        borderBottom: "1px solid #e0e0e0",
                        color: "#424242", // Neutral gray
                        "&:hover": { backgroundColor: "#e0e0e0" }, // Slightly darker hover
                      }}
                      onClick={() => {
                        navigate(`/users/${user._id}`);
                        setDropdownOpen(false); // Close dropdown after click
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <AccountCircleIcon sx={{ color: "#424242" }} />
                      </ListItemIcon>
                      Profile
                    </Button>

                    {/* Photos Button */}
                    <Button
                      sx={{
                        justifyContent: "flex-start",
                        padding: "10px 20px",
                        textAlign: "left",
                        borderBottom: "1px solid #e0e0e0",
                        color: "#424242", // Neutral gray
                        "&:hover": { backgroundColor: "#e0e0e0" }, // Slightly darker hover
                      }}
                      onClick={() => {
                        navigate(`/photos/${user._id}`);
                        setDropdownOpen(false); // Close dropdown after click
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <PhotoLibraryIcon sx={{ color: "#424242" }} />
                      </ListItemIcon>
                      Photos
                    </Button>

                    {/* Logout Button */}
                    <Button
                      sx={{
                        justifyContent: "flex-start",
                        padding: "10px 20px",
                        textAlign: "left",
                        color: "#d32f2f", // Red for logout
                        "&:hover": { backgroundColor: "#ffcdd2" }, // Subtle red hover
                      }}
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false); // Close dropdown after logout
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <ExitToAppIcon sx={{ color: "#d32f2f" }} />
                      </ListItemIcon>
                      Logout
                    </Button>
                  </Box>
                )}
            </Box>

            <Grid item>
              {id && user ? (
                <Box display="flex" alignItems="center">
                  {path === "users" ? (
                    <>
                      <GroupIcon
                        sx={{ color: "#4caf50", marginRight: "5px" }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                       Details of {fname}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <PhotoLibraryIcon
                        sx={{ color: "#ff9800", marginRight: "5px" }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        Photos of {fname}
                      </Typography>
                    </>
                  )}
                </Box>
              ) : (
                ""
              )}
            </Grid>

            <Grid item>
              {user ? (
                <>
                <Button
                variant="contained"
                onClick={goToFavorites} // Navigate to favorites page
                startIcon={<FavoriteIcon />}
                style={{
                  backgroundColor: "#e91e63",
                  color: "#fff",
                  marginLeft: "10px",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#c2185b")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#e91e63")}
              >
                Favorites
              </Button>

                  <Button 
                    variant="contained"
                    onClick={() => setOpenUploadDialog(true)}
                    startIcon={<PhotoCameraIcon />}
                    style={{
                      backgroundColor: "#4caf50",
                      color: "#fff",
                      marginLeft: "10px",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#388e3c")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#4caf50")}
                  >
                    Add Photo
                  </Button>
                  <Button
                  variant="contained"
                  onClick={goToActivities}
                  startIcon={<EventNoteIcon />}
                  style={{
                    backgroundColor: "#ff9800",
                    color: "#fff",
                    marginLeft: "10px",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#f57c00")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#ff9800")}
                  >
                    Activities
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleLogout}
                    startIcon={<ExitToAppIcon />}
                    style={{
                      backgroundColor: "#2196f3",
                      color: "#fff",
                      marginLeft: "10px",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#1976d2")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#2196f3")}
                  >
                    Logout
                  </Button>
                  <Button
                  variant="contained"
                  onClick={() => setDeleteDialogOpen(true)}
                  startIcon={<WarningIcon />}
                  style={{
                    backgroundColor: "#d32f2f",
                    color: "#fff",
                    marginLeft: "10px",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#b71c1c")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#d32f2f")}
                  >
                    Delete Account
                  </Button>
                </>
              ) : null}
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      <PhotoUploadDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        setParray={setParray}
        showSnackbar={showSnackbar}
        id={user?._id}
      />

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        autoHideDuration={3000}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title" style={{ display: "flex", alignItems: "center" }}>
          <WarningIcon style={{ marginRight: 10, color: "#ff5722" }} />
          Confirm Account Deletion
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete your account? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="secondary" variant="contained">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TopBar;
