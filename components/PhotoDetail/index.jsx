import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography, Paper} from "@mui/material";
import axios from "axios";
import CommentSection from "../CommentSection";
import ImageDisplay from "../ImageDisplay";
import { formatDateToWords } from "../../utils";

function PhotoDetail(){
    
    const {userId, photoId }= useParams();
    const [photos, setPhotos] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() =>{
        const fetchData = async() => {
            try{
    
              const [res]= await Promise.all([
                axios.get(`http://localhost:3000/photosOfUser/${userId}`)
              ]);
    
              setPhotos(res.data);
    
            } catch (error) {
              console.error("Failed to fetch data:", error);
            };
          }
          fetchData();
        
      }, [photoId, userId]);

    const photo = photos.filter(p => p._id === photoId);

    const handleClick = (event, id) => {
        event.preventDefault();
        navigate(`/users/${id}`);
    };
    
    if (!photo) {
            return <div>Loading...</div>;
          }
        
    return (
    
    <div>
      <Typography variant="h4" gutterBottom>{photo[0]?.file_name}</Typography>
      <ImageDisplay src={`../../images/${photo[0]?.file_name}`} alt={photo[0]?.file_name} date={formatDateToWords(photo[0]?.date_time)} />
      <CommentSection comments={photo[0]?.comments} handleClick={handleClick} />
    </div>


    );
}
export default PhotoDetail;