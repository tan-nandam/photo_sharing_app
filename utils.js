export const formatDateToWords = (dateString)=> {
    const date = new Date(dateString);
    
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",  // Full month name
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,   // 12-hour format with AM/PM
    });
  };