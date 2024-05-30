const ErrorHandler = require("../utils/errorhandleer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Connection = require("../config/database");
const { error } = require("console");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const sendToken = require("../utils/jwtToken");

//Registe User

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password, email } = req.body;

  Connection.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    (error, result) => {
      if (error) {
        console.log(error);
      }

      if (result.length > 0) {
        return next(
          new ErrorHandler("User already exists with this email", 400)
        );
      }
    }
  );

  // // Hash password
  const hashedPassword = await bcryptjs.hash(password, 10);

  Connection.query(
    "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
    [username, hashedPassword, email],
    (error, result) => {
      if (error) {
        console.log(error);
        res.status(501).json({ message: error.message });
      } else {
        const userId = result.insertId;

        const notificationMessage = `User ${username} has been registered`;

        Connection.query(
          "INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)",
          [userId, notificationMessage, false]
        );

        Connection.commit();
        res.status(201).json({ message: "User registered successfully" });
      }
    }
  );
});
//Login User

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  Connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (error, result) => {
      if (error) {
        console.log(error);
      }

      if (result.length == 0) {
        return next(new ErrorHandler("User not found", 400));
      }

      console.log("kashif", result[0]);

      const isPasswordValid = bcryptjs.compare(password, result[0].password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Invalid password", 401));
      }

      // Generate JWT token
      const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      sendToken(result[0], 200, res, token);
    }
  );
});

//Get User Profile
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const userId = req.id;

  Connection.query(
    "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
    [userId],
    (error, results) => {
      if (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }

      if (results.length === 0) {
        return next(new ErrorHandler("User not found", 404));
      }

      const userProfile = results[0];
      res.status(200).json({ userProfile });
    }
  );
});
