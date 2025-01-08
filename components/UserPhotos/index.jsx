import React, { useEffect, useState } from "react";
import { Typography, Button, Box } from "@mui/material";
import axios from 'axios';
import { PhotoCameraBack as PhotoIcon } from "@mui/icons-material";
import "./styles.css";
import PhotoViewer from "../PhotoViewer";
import { formatDateToWords } from "../../utils";

function UserPhotos(props) {
  const userId = props.userId; // Access userId from props
  const [parray, setParray] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(()=>{
    axios.get(`http://localhost:3000/photosOfUser/${userId}`)
    .then((response) =>{
      const sortedPhotos = response.data.sort((a, b) => b?.likeCount - a?.likeCount);
      setParray(sortedPhotos);  // Set the sorted array to state
    })
    .catch((error) =>{
      console.error("Failed to fetch version:", error);
    });
  }, [userId, parray]);
  
  const updatePhotoComments = (updatedPhoto) => {
    setParray((prevArray) => {return prevArray.map((photo) => 
      {return photo._id === updatedPhoto._id ? updatedPhoto : photo;}
      );
  });
  };

  const handleSwipeRightClick = ()=>{
    if(idx < parray.length-1){
    setIdx(idx+1);
    }
  };
  const handleSwipeLeftClick = () =>{
    if(idx > 0){
    setIdx(idx-1);
    }
  };
  if(parray.length === 0){
    return (
    <Box

      sx={{

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        height: "100vh", // Full viewport height

        textAlign: "center",

      }}

    >

      <PhotoIcon sx={{ fontSize: 100, color: "#ccc", marginBottom: 2 }} />

      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#555", marginBottom: 2 }}>

        Uh-oh, no photos available.

      </Typography>

      <Typography variant="body1" sx={{ color: "#777", maxWidth: 400 }}>

        It looks like this user hasn't uploaded any photos yet. Come back later to check out their awesome memories!

      </Typography>

    </Box>

  );
  }

  return (
    <Typography variant="body1">
      {/* This should be the UserPhotos view of the PhotoShare app. Since it is
      invoked from React Router the params from the route will be in property
      match. So this should show details of user: {userId}. You can fetch the
      model for the user from window.models.photoOfUserModel(userId): */}
      <Typography variant="caption">
        {/* {JSON.stringify(window.models.photoOfUserModel(userId))} */}
        
        {/* {parray.map((photo, index) => {
          return (
          <figure key = {index} style={{ textAlign: "center", margin: "20px" }}>
            <img 
              src={`../../images/${photo.file_name}`}
              alt="" 
              style={{ maxWidth: "100%", height: "auto" }} 
            />
            <figcaption style={{ marginTop: "10px", fontStyle: "italic" }}>
              {photo.date_time}
            </figcaption>
            <h2>Comments:</h2>
            
            {photo.comments? 
             photo.comments.map((cmt, idx)=>{
              return (
                <div key={idx}>
                <p>{cmt.comment}</p>
                <caption>{formatDateToWords(cmt.date_time)}</caption>
                <button onClick= {(event) => handleClick(event, cmt.user._id)}>{cmt.user.first_name}</button>
                </div>
              );
            }): "No comments"}
          </figure>
          );

          })} */}

          
          <PhotoViewer idx={idx} parray={parray} formatDateToWords={formatDateToWords} updatePhotoComments={updatePhotoComments} userId={userId}/>
          
          <Button onClick={handleSwipeLeftClick} disabled={idx===0}>Swipe Left</Button>
          <Button onClick={handleSwipeRightClick} disabled={idx===parray.length-1}>Swipe Right</Button>
        
      </Typography>
    </Typography>
  );
}

export default UserPhotos;
