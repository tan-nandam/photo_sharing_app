import { color } from "@mui/system";

export default {
  control: {
    backgroundColor: "#fff",
    fontSize: 14,
    fontWeight: "normal",
    color: "#cee4e5",
    border: "none", // Remove outer border
    boxShadow: "none", // Remove any shadow effects
  },

  "&multiLine": {
    control: {
      fontFamily: "monospace",
      minHeight: 63,
    },
    highlighter: {
      padding: 9,
      border: "none", // Remove the highlighter border
    },
    input: {
      padding: 9,
      border: "none", // Remove the input border
    },
  },

  "&singleLine": {
    display: "inline-block",
    width: 180,

    highlighter: {
      padding: 1,
      border: "none", // Remove highlighter border
    },
    input: {
      padding: 1,
      border: "none", // Remove input border
    },
  },

  suggestions: {
    list: {
      backgroundColor: "white",
      border: "1px solid rgba(0,0,0,0.15)",
      fontSize: 14,
    },
    item: {
      padding: "5px 15px",
      borderBottom: "1px solid rgba(0,0,0,0.15)",
      "&focused": {
        backgroundColor: "#cee4e5",
      },
    },
  },

  // Custom styling for mentions
  mention: {
    backgroundColor: "#daf4fa", // Highlight mention background
    fontWeight: "bold", // Bold the mention text
    color: "#0073e6", // Blue color for mentions
  },
};
