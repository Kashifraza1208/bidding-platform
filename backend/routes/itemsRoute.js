const {
  createItem,
  getItems,
  getItemDetails,
  deleteItem,
  updateItem,
} = require("../controllers/itemsController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.route("/items").post(isAuthenticatedUser, createItem);

router.route("/items").get(getItems);

router.route("/items/:id").get(getItemDetails);

router
  .route("/items/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteItem);
router
  .route("/items/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateItem);

module.exports = router;
