const Activity = require('./schema/activity'); // Activity schema


async function logActivity(io,activityType, userId, additionalInfo = {}) {
  try {
    // Create an activity record in the database
    const activity = await Activity.create({
      activity_type: activityType,
      user_id: userId,
      date_time: new Date(),
      ...additionalInfo,
    });

    console.log("Activityyyyy",activity);
    // Emit the activity to connected clients
    io.emit('new-activity', {
      activity_type: activityType,
      user_id: userId, // Send userId
      ...additionalInfo,
      date_time: activity.date_time,
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

module.exports = logActivity;
