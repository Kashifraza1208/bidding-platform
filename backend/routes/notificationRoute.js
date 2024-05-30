const {
  getNotifications,
  markNotificationsAsRead,
  createNotification,
} = require("../controllers/notificationController");

const { isAuthenticatedUser } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router
  .route("/notifications/mark-read")
  .post(isAuthenticatedUser, markNotificationsAsRead);

router.route("/notifications").get(isAuthenticatedUser, getNotifications);

router.route("/notifications").post(isAuthenticatedUser, createNotification);

module.exports = router;
