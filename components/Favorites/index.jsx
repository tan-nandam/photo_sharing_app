import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Paper,
  Grid,
  IconButton,
  Tooltip,
  Modal,
  Typography,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

const Favorites = ({ userId }) => {
  const [favoritedPhotos, setFavoritedPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const fetchFavoritedPhotos = async () => {
      try {
        const response = await axios.get(`/favorites/${userId}`, {
          withCredentials: true,
        });
        setFavoritedPhotos(response.data);
      } catch (error) {
        console.error("Error fetching favorited photos:", error);
      }
    };

    fetchFavoritedPhotos();
  }, [userId]);

  const handleOpenModal = (photo) => {
    setSelectedPhoto(photo);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleRemoveFavorite = async (photoId) => {
    try {
      await axios.post("/favorites/remove", { userId, photoId }, { withCredentials: true });
      setFavoritedPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  return (
    <Paper sx={{ padding: 3, backgroundColor: "#fff", borderRadius: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        My Favorite Photos
      </Typography>
      <Grid container spacing={4}>
        {favoritedPhotos?.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo._id}>
            <Box
              sx={{
                position: "relative",
                borderRadius: 2,
                boxShadow: 3,
                overflow: "hidden",
                backgroundColor: "#fff",
                border: "8px solid",
                borderImage: "black", // Pattern for border
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              <img
                src={`../../images/${photo?.file_name}`}
                alt={photo?.file_name}
                style={{
                  width: "100%",
                  height: "200px", // Fixed height for all images
                  objectFit: "cover", // Ensures images don't stretch and maintain aspect ratio
                  cursor: "pointer",
                }}
                onClick={() => handleOpenModal(photo)}
              />
              <Tooltip title="Remove from Favorites" placement="top">
                <IconButton
                  onClick={() => handleRemoveFavorite(photo._id)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "#ffebee",
                    color: "#d32f2f",
                    transition: "background-color 0.3s ease, color 0.3s ease", // Smooth transition for color change
                    "&:hover": {
                      backgroundColor: "#ffcdd2",
                      color: "#c2185b", // Slightly darker color for hover effect
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 28 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Modal for Photo Viewer */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            padding: 3,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          {selectedPhoto && (
            <Box
              sx={{
                position: "relative",
                maxWidth: "80%",
                maxHeight: "80%",
                borderRadius: 3,
                boxShadow: 4,
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <img
                src={`../../images/${selectedPhoto?.file_name}`}
                alt={selectedPhoto?.file_name}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
              <Typography
                variant="body1"
                align="center"
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: 4,
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                }}
              >
                {formatDate(selectedPhoto?.date_time)}
              </Typography>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 36 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Modal>
    </Paper>
  );
};

export default Favorites;
