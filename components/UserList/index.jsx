import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { List, ListItem, Typography, Button, Divider } from "@mui/material";
import io from "socket.io-client"; // Import Socket.IO client
import "./styles.css";

function UserList() {
  const [users, setUsers] = useState([]);
  const [userActivities, setUserActivities] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsersAndActivities() {
      try {
        // Fetch user list
        const { data: userList } = await axios.get("http://localhost:3000/user/list");
        setUsers(userList);
  
        // Fetch recent activities for all users
        const activities = await Promise.all(
          userList.map(async (user) => {
            try {
              const { data } = await axios.get(`http://localhost:3000/sidebar/${user._id}`);
              return { userId: user._id, activity: data[0] || null }; // Most recent activity or null
            } catch (error) {
              console.error(`No activities for user ${user._id}:`, error);
              return { userId: user._id, activity: null }; // Handle errors gracefully
            }
          })
        );
  
        // Map activities to users
        console.log("activities:", activities);
        const activityMap = activities.reduce((map, item) => {
          map[item.userId] = item.activity;
          return map;
        }, {});
        setUserActivities(activityMap);
        console.log("activityMap:", activityMap);
      } catch (error) {
        console.error("Failed to fetch users or activities:", error);
      }
    }
  
    fetchUsersAndActivities();

    // Polling every 5 seconds to check for updated activities
    const intervalId = setInterval(() => {
      fetchUsersAndActivities();
    }, 5000); // Poll every 5 seconds

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  
  }, []);
  

  const handleUserClick = (id) => {
    navigate(`/users/${id}`);
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        User List
      </Typography>
      <List component="nav">
        {users.map((user) => (
          <div key={user._id}>
            <ListItem>
              <Button
                fullWidth
                variant="text"
                onClick={() => handleUserClick(user._id)}
                style={{ justifyContent: "flex-start" }}
              >
                <div>
                  <Typography>{user.first_name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {userActivities[user._id]
                      ? formatActivity(userActivities[user._id])
                      : "No recent activity"}
                  </Typography>
                </div>
              </Button>
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>
    </div>
  );
}

function formatActivity(activity) {
  const { activity_type, date_time, thumbnail } = activity;

  switch (activity_type) {
    case "Photo Upload":
      return (
        <span>
          Posted a photo <img src={`../../images/${thumbnail}`} alt="thumbnail" style={{ width: 30, height: 30 }} />
        </span>
      );
    case "New Comment":
      return "Added a comment";
    case "User Registration":
      return "Registered as a user";
    case "User Login":
      return "Logged in";
    case "User Logout":
      return "Logged out";
    default:
      return "Unknown activity";
  }
}

export default UserList;
