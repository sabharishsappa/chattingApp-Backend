const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const chatController = require("./../controllers/chatController");

router.use(authController.protect);

router
  .route("/")
  .post(chatController.accessChat)
  .get(chatController.getAllChats);

router.route("/group").post(chatController.accessGroupChat);
// .get(getAllGroupChats);
router.route("/renameGroup").put(chatController.renameGroupChat);
router.route("/addSomeoneToGroup").put(chatController.addSomeoneToGroup);
router
  .route("/removeSomeoneFromGroup")
  .put(chatController.removeSomeoneFromGroup);

module.exports = router;
