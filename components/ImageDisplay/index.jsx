// ImageDisplay.jsx
import React from "react";

const ImageDisplay = ({ src, alt, date }) => {
  return (
    <figure style={{ textAlign: "center" }}>
      <img src={src} alt={alt} style={{ maxWidth: "100%", height: "auto", borderRadius: "10px" }} />
      <figcaption style={{ marginTop: "10px", fontStyle: "italic", color: "#757575" }}>
        {date}
      </figcaption>
    </figure>
  );
};

export default ImageDisplay;
