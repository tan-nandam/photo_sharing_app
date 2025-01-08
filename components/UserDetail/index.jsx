import React, { useEffect, useState } from "react";
import { List, ListItem, Typography, Button, Grid, Box } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import "./styles.css";
import axios from 'axios';

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function UserDetail({ userId }) {
  const [user, setUser] = useState(null);
  const [recentPhoto, setRecentPhoto] = useState(null);
  const [photoWithMaxComments, setPhotoWithMaxComments] = useState(null);
  const [photoMentions, setPhotoMentions] = useState(null);

  useEffect(() => {
    if (userId) {
      const fetchData = async() => {
        try{

          const [res1, res2, res3, res4]= await Promise.all([
            axios.get(`http://localhost:3000/user/${userId}`),
            axios.get(`http://localhost:3000/recentPhotoOfUser/${userId}`),
            axios.get(`http://localhost:3000/highlyCommentedPhoto/${userId}`),
            axios.get(`http://localhost:3000/mentionsOfUser/${userId}`)
          ]);

          setUser(res1.data);
          setRecentPhoto(res2.data);
          setPhotoWithMaxComments(res3.data);
          setPhotoMentions(res4.data);

        } catch (error) {
          console.error("Failed to fetch data:", error);
        };
      }
      fetchData();
    }
  }, [userId]);

  
  const navigate = useNavigate();
  const handlePhotoClick = (id) => {
    navigate(`/photos/${id}`);
  };

  const handlePhotoViewerClick = (userId,pId) =>{
    navigate(`/photos/${userId}/${pId}`);
  };
  const handleClick = (event, id) => {
    navigate(`/users/${id}`);
  };
  
  if (!user) {
    return <Typography variant="body1">Loading user details...</Typography>; // Optional loading state
  }

  return (
    <div className="user-details-page">
      <Typography variant="h6" gutterBottom className="user-details">
        User Details
      </Typography>
      <List>
        <ListItem>Id: {user._id}</ListItem>
        <ListItem>First Name: {user.first_name}</ListItem>
        <ListItem>Last Name: {user.last_name}</ListItem>
        <ListItem>Location: {user.location}</ListItem>
        <ListItem>Description: {user.description}</ListItem>
        <ListItem>Occupation: {user.occupation}</ListItem>
      </List>
      <button
        style={{ cursor: 'pointer' }} // Optional: Change cursor style for button
        onClick={() => handlePhotoClick(user._id)}
      >
        Switch to Photos
      </button>

      <div className="photos-section">
      {(recentPhoto != "No photos found") && (
        <div className="recent-photo-container">
          <img src={`../../images/${recentPhoto.file_name}`} 
               alt="Recent Thumbnail" 
               className="thumbnail" 
               onClick={() => handlePhotoViewerClick(userId,recentPhoto._id)}/>
          <p className="date">Date Created: {new Date(recentPhoto.date_time).toLocaleDateString()}</p>
          <p className="caption">Recently Uploaded Photo</p>
        </div>
      )}

      {(photoWithMaxComments != "No photos with comments found")? (
        <div className="highly-commented-photo-container">
        <img 
          src={`../../images/${photoWithMaxComments.file_name}`} 
          alt="Highly Commented Thumbnail" 
          className="thumbnail" 
          onClick={() => handlePhotoViewerClick(userId,photoWithMaxComments._id)}
        />
        <p className="comments-count">Comments Count: {photoWithMaxComments.comments.length}</p>
        <p className="caption">Photo With Highest Comments</p>
      </div>
    ) : (
      <p className="no-comments">No comments for the photo</p>
      )}

      </div>
      <div>
      <h2>@MENTIONS</h2>
      <Box>
        {photoMentions.length > 0 ? (
          <Grid container spacing={3}>
            {photoMentions.map((photo) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={photo?._id}>
                <Box
                  className="mention-container"
                  sx={{
                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                    borderRadius: "8px",
                    boxShadow: 2,
                    backgroundColor: getRandomColor(), // Apply random background color
                    transition: "transform 0.3s ease",
                    '&:hover': {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <img
                    src={`../../images/${photo?.file_name}`}
                    alt={photo?.file_name}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                    }}
                    onClick={() => handlePhotoViewerClick(photo?.user_id?._id, photo?._id)}
                  />
                  <Box sx={{ position: "absolute", bottom: 10, left: 10, backgroundColor: "rgba(0, 0, 0, 0.6)", color: "#fff", padding: "5px 10px", borderRadius: "5px" }}>
                    <Button
                      size="small"
                      sx={{
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: "bold",
                      }}
                      onClick={(event) => handleClick(event, photo?.user_id?._id)}
                    >
                      {photo?.user_id?.first_name}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2">No photos found for these mentions.</Typography>
        )}
      </Box>
    </div>
    </div>
  );
}

export default UserDetail;
