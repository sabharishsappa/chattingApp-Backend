const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("./../controllers/messageController");

const authController = require("../controllers/authController");
const router = express.Router();
router.use(authController.protect);
router.route("/:chatId").get(allMessages);
router.route("/").post(sendMessage);

module.exports = router;
