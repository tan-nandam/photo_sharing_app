import React, { useState, useEffect } from "react";
import { Paper, Typography, Grid, Avatar } from "@mui/material";
import { PersonAdd, Logout, Login, Comment, UploadFile } from "@mui/icons-material"; // Importing icons
import axios from "axios";
import { formatDateToWords } from "../../utils"; // Utility function for formatting date

const Activities = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/activities")
      .then((response) => {
        setActivities(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch activities:", error);
      });
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          User Activities
        </Typography>
      </Grid>

      <Grid item xs={12}>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <Paper key={index} elevation={2} style={{ margin: "10px 0", padding: "15px" }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  {/* Thumbnail and Icon Section */}
                  {activity.photoFileName ? (
                    <img
                      src={`../../images/${activity.photoFileName}`}
                      alt="Thumbnail"
                      style={{
                        width: 75,
                        height: 75,
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <>
                      {activity.activity_type === "Login" && (
                        <Login style={{ fontSize: 40, color: "#1976d2" }} />
                      )}
                      {activity.activity_type === "Logout" && (
                        <Logout style={{ fontSize: 40, color: "#d32f2f" }} />
                      )}
                    </>
                  )}
                </Grid>
                <Grid item xs>
  <Typography variant="body1">
    {activity.photoFileName ? (
      <>
        {activity.description}
        <Typography variant="body2" style={{ color: "#616161" }}>
          {activity.activity_type === "Photo Upload" ? (
            <>
              <UploadFile
                style={{
                  fontSize: "1rem",
                  verticalAlign: "middle",
                  marginRight: 5,
                }}
              />
              Uploaded a photo
            </>
          ) : (
            <>
              <Comment
                style={{
                  fontSize: "1rem",
                  verticalAlign: "middle",
                  marginRight: 5,
                }}
              />
              Commented on a photo
            </>
          )}
        </Typography>
      </>
    ) : activity.activity_type === "User Login" ? (
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
          <Login style={{ fontSize: 40, color: "#1976d2" }} /> {/* Login Icon */}
        </Grid>
        <Grid item xs>
          <Typography variant="body1" style={{ color: "#616161" }}>
            {activity.userName || "Non Existent User"} logged in
          </Typography>
        </Grid>
      </Grid>
    ) : activity.activity_type === "User Logout" ? (
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
          <Logout style={{ fontSize: 40, color: "#f44336" }} /> {/* Logout Icon */}
        </Grid>
        <Grid item xs>
          <Typography variant="body1" style={{ color: "#616161" }}>
            {activity.userName || "Non Existent User"} logged out
          </Typography>
        </Grid>
      </Grid>
    ) : activity.activity_type === "User Registration" ? (
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
        <PersonAdd style={{ fontSize: 40, color: "#4caf50" }} /> {/* Register Icon */}
        </Grid>
        <Grid item xs>
          <Typography variant="body1" style={{ color: "#616161" }}>
            {activity.userName || "Non Existent User"} registered an account
          </Typography>
        </Grid>
      </Grid>
    ) : <div>
        {activity.activity_type === "Photo Upload" && !activity.photoFileName && (
        <Typography variant="body2" color="textSecondary">
          Photo not found
        </Typography>
      )}

      {activity.activity_type === "New Comment" && !activity.photoFileName && (
        <Typography variant="body2" color="textSecondary">
          Comment not found
        </Typography>
      )}

      </div>}

  </Typography>
  <Typography
    variant="caption"
    style={{ display: "block", color: "#616161" }}
  >
    {formatDateToWords(activity.date_time)}
  </Typography>
</Grid>

              </Grid>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No activities found.
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default Activities;
