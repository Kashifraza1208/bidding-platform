const Connection = require("../config/database");
const ErrorHandler = require("../utils/errorhandleer");
const catchAsyncErrors = require("./catchAsyncErrors");
const JWT = require("jsonwebtoken");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decodedData = JWT.verify(token, process.env.JWT_SECRET);

  Connection.query(
    "SELECT * FROM users WHERE id = ?",
    [decodedData.id],
    (error, results) => {
      if (error || results.length === 0) {
        return next(new ErrorHandler("User not found", 401));
      }

      req.user = results[0];
      next();
    }
  );
});

exports.authorizeRoles = (...roles) => {

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role : ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};
