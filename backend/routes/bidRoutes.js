const { createBid, getSpeficBid } = require("../controllers/bidController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.route("/items/:itemId/bids").post(isAuthenticatedUser, createBid);

router.route("/items/:itemId/bids").get(getSpeficBid);

module.exports = router;
