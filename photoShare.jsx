import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Typography, Paper, CssBaseline, Box } from "@mui/material";
import { HashRouter, Route, Routes, useParams, Navigate} from "react-router-dom";

import "./styles/main.css"; // Ensure any custom styling is applied correctly
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import PhotoDetail from "./components/PhotoDetail";
import Activities from "./components/Activities";
import Favorites from "./components/Favorites";

// Helper Route Components
function UserDetailRoute({ setPathAndId }) {
  const { userId } = useParams();
  setPathAndId("users", userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute({ setPathAndId }) {
  const { userId } = useParams();
  setPathAndId("photos", userId);
  return <UserPhotos userId={userId} />;
}

function PhotoShare() {
  const [user, setUser] = useState(null);
  const [path, setPath] = useState("");
  const [id, setId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const setPathAndId = (path1, id1) => {
    setPath(path1);
    setId(id1);
  };


  useEffect(() => {
    const checkUserSession = async () => {
      try {
        
        // Fetch the current user details
        const response = await fetch("/admin/current-user", { credentials: "include" });
        if (response.ok) {
          const user1 = await response.json();
          setUser(user1); // Set the logged-in user details
        } else {
          setUser(null); // Reset user state if not authenticated
        }
      
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }finally{
        setIsLoading(false);
      }
    };
  
    checkUserSession(); // Call the function to check user session on component mount
  }, []);
  
  if(isLoading) return <div>Loading...</div>;

  return (
    <HashRouter>
      <CssBaseline />
      <Box className="main-container">
        {/* Top Bar */}
        <TopBar path={path} id={id} user={user} setUser={setUser} />
        <div className="main-topbar-buffer" />
        {/* Main Content */}
        <Grid container spacing={2} className="main-grid">
          {/* User List Panel */}
          <Grid item sm={3} xs={12}>
            <Paper className="user-list-paper">
              {user ? <UserList /> : <Typography>Please login to see users.</Typography>}
            </Paper>
          </Grid>

          {/* Main Content Panel */}
          <Grid item sm={9} xs={12}>
            <Paper className="main-content-paper">
              <Routes>
                <Route
                  path="/"
                  element={user ? <Navigate to={`/users/${user._id}`} /> : <LoginRegister setUser={setUser} />}
                />
                <Route 
                  path="/users/:userId" 
                  element={user ? <UserDetailRoute setPathAndId={setPathAndId} /> : <Navigate to="/" />} 
                />
                <Route 
                  path="/photos/:userId" 
                  element={user ? <UserPhotosRoute setPathAndId={setPathAndId} /> : <Navigate to="/" />} 
                />
                {/* <Route path="/users" element={user ? <UserList /> : <Navigate to="/" />} /> */}
                <Route path="/photos/:userId/:photoId/" element={user? <PhotoDetail /> : <Navigate to="/" />} />
                <Route path="/activities" element={user? <Activities /> : <Navigate to="/" />} /> 
                <Route path="/favorites"  element={user? <Favorites userId={user._id}/> : <Navigate to="/" />} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);
