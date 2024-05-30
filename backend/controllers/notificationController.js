const Connection = require("../config/database");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandleer");

exports.createNotification = catchAsyncErrors(async (req, res, next) => {
  const { message } = req.body;
  const user_id = req.user.id;

  Connection.query(
    "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
    [user_id, message],
    (error, result) => {
      if (error) {
        return next(new ErrorHandler("Internal server error", 500));
      } else {
  
        const newNotificationId = result.insertId;

        res.status(201).json({
          success: true,
          message: "Notification created successfully",
          newNotificationId,
          result,
        });
      }
    }
  );
});

// Retrieve notifications for the logged-in user
exports.getNotifications = catchAsyncErrors(async (req, res, next) => {
  Connection.query(
    "SELECT * FROM notifications WHERE is_read=false",
    (error, results) => {
      if (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }

      res.status(200).json({ success: true, notifications: results });
    }
  );
});

// Mark notifications as read
exports.markNotificationsAsRead = catchAsyncErrors(async (req, res, next) => {
  const { notificationIds } = req.body;

  const query = "SELECT COUNT(*) AS count FROM notifications WHERE id = ?";
  Connection.query(query, [notificationIds], (error, results) => {
    if (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
    const count = results[0].count;
    if (count > 0) {
      Connection.query(
        "UPDATE notifications SET is_read = true WHERE id IN (?)",
        [notificationIds],
        (error, results) => {
          if (error) {
            return next(new ErrorHandler("Internal server error", 500));
          }

          res
            .status(200)
            .json({ success: true, message: "Notifications marked as read" });
        }
      );
    } else {
      return res.status(200).json({ success: false, exists: false });
    }
  });
});
