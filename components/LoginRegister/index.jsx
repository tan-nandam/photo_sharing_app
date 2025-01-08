import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Modal,
  Box,
  Snackbar,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // Import Close icon
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd"; // Import Register icon
import axios from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800, // Increased width for better layout
  maxHeight: "80vh", // Limit height to make it scrollable
  overflowY: "auto", // Enable vertical scrolling
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function LoginRegister({ setUser }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    login_name: "",
    password: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false);
    // Clear all login fields when closing the modal
    setLoginName(""); // Clear login name field
    setPassword(""); // Clear password field
    setError("");
  };

  const handleLogin = () => {
    axios
      .post("http://localhost:3000/admin/login", {
        login_name: loginName,
        password: password,
      })
      .then((response) => {
        setUser(response.data); // Assuming response contains user data
      })
      .catch((err) => {
        setError("Login failed. Please try again.");
        console.error("Login error:", err);
      });
  };

  const handleRegister = () => {
    const missingFields = [];

    // Check for required fields and add to missingFields array
    if (!registrationData.login_name) missingFields.push("Login Name");
    if (!registrationData.password) missingFields.push("Password");
    if (!registrationData.first_name) missingFields.push("First Name");
    if (!registrationData.last_name) missingFields.push("Last Name");
    
    // Note: The following fields are not required, so we don't check for them.
    // if (!registrationData.location) missingFields.push("Location");
    // if (!registrationData.occupation) missingFields.push("Occupation");

    // Check if passwords match
    if (registrationData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // If there are missing fields, set the error message
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Proceed with registration if all fields are valid
    axios
      .post("http://localhost:3000/user", registrationData)
      .then(() => {
        setSnackbarMessage("User registered successfully!");
        setSnackbarOpen(true);
        handleCloseRegisterModal(); // Close modal and clear fields
      })
      .catch((err) => {
        setError(err.response?.data || "Registration failed.");
        console.error("Registration error:", err);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update registration fields
    if (name in registrationData) {
      setRegistrationData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    // Update login fields
    if (name === "login_name") {
      setLoginName(value);
    } else if (name === "password") {
      setPassword(value);
    }

    // Update confirm password if it is the confirm field
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  const handleOpenRegisterModal = () => {
    // Reset registration fields when opening the modal
    setRegistrationData({
      login_name: "",
      password: "",
      first_name: "",
      last_name: "",
      location: "",
      description: "",
      occupation: "",
    });
    setConfirmPassword(""); // Clear confirm password field
    setError(""); // Clear error message if any
    setRegisterModalOpen(true); // Open modal
  };



  return (
    <div>
      <Typography variant="h5">Login</Typography>
      <TextField
        label="Login Name"
        name="login_name"
        value={loginName}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            startIcon={<LoginIcon />} // Add Login icon
          >
            Login
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenRegisterModal}
            startIcon={<PersonAddIcon />} // Add Register icon
          >
            Register Me
          </Button>
        </Grid>
      </Grid>
      {error && <Typography color="error">{error}</Typography>}
      <Modal
        open={registerModalOpen}
        onClose={handleCloseRegisterModal} // Use the new close handler
      >
        <Box sx={style}>
          <IconButton
            onClick={handleCloseRegisterModal} // Use the new close handler
            sx={{ position: "absolute", right: 16, top: 16 }} // Position close button
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Register</Typography>
          {error && <Typography color="error">{error}</Typography>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Login Name *"
                name="login_name"
                value={registrationData.login_name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required // Indicate that this field is required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password *"
                type="password"
                name="password"
                value={registrationData.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required // Indicate that this field is required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Password *"
                type="password"
                name="confirmPassword" // New field for confirmation
                value={confirmPassword}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required // Indicate that this field is required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name *"
                name="first_name"
                value={registrationData.first_name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required // Indicate that this field is required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name *"
                name="last_name"
                value={registrationData.last_name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required // Indicate that this field is required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                name="location"
                value={registrationData.location}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Occupation"
                name="occupation"
                value={registrationData.occupation}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={registrationData.description}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={4} // Allow multiple lines for better visibility
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRegister}
            style={{ marginTop: "16px" }}
          >
            Register
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
}

export default LoginRegister;
