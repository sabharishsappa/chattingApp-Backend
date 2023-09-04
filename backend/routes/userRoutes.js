const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

router
  .route("/")
  .post(authController.signUp)
  .get(authController.protect, userController.allUsers);
router.route("/login").get(authController.login);

module.exports = router;
