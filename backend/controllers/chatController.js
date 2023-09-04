const asyncHandler = require("express-async-handler");
const Chat = require("./../models/chatModel");
const User = require("./../models/userModel");

exports.accessChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("User Id param is not sent along with req!!");
    return res.sendStatus(404);
  }

  // Find the chat where the logged-in user and the specified userId are participants
  var isChat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name profilePic email",
  });

  if (isChat) {
    res.send(isChat);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createdChat._id).populate(
        "users",
        "-password"
      );

      res.status(200).send(fullChat);
    } catch (err) {
      throw new Error(err.message);
    }
  }
});

exports.getAllChats = asyncHandler(async (req, res, next) => {
  try {
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", (select = "-password"))
      .populate("groupAdmin", (select = "-password"))
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name email profilePic",
        });

        res.status(200).send(results);
      });
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

exports.accessGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

exports.renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

exports.addSomeoneToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

exports.removeSomeoneFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});
// exports.accessGroupChat = asyncHandler(async (req, res) => {
//   if (!req.body.users || !req.body.name) {
//     return res.status(400).send({ message: "Please Fill all the feilds" });
//   }

//   var users = JSON.parse(req.body.users);

//   if (users.length < 2) {
//     return res
//       .status(400)
//       .send("More than 2 users are required to form a group chat");
//   }

//   users.push(req.user);

//   try {
//     const groupChat = await Chat.create({
//       chatName: req.body.name,
//       users: users,
//       isGroupChat: true,
//       groupAdmin: req.user,
//     });

//     const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
//       .populate("users", "-password")
//       .populate("groupAdmin", "-password");

//     res.status(200).json(fullGroupChat);
//   } catch (error) {
//     res.status(400);
//     throw new Error(error.message);
//   }
// });

// // @desc    Rename Group
// // @route   PUT /api/chat/rename
// // @access  Protected
// exports.renameGroupChat = asyncHandler(async (req, res) => {
//   const { chatId, chatName } = req.body;

//   const updatedChat = await Chat.findByIdAndUpdate(
//     chatId,
//     {
//       chatName: chatName,
//     },
//     {
//       new: true,
//     }
//   )
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   if (!updatedChat) {
//     res.status(404);
//     throw new Error("Chat Not Found");
//   } else {
//     res.json(updatedChat);
//   }
// });

// // @desc    Remove user from Group
// // @route   PUT /api/chat/groupremove
// // @access  Protected
// exports.removeSomeoneFromGroup= asyncHandler(async (req, res) => {
//   const { chatId, userId } = req.body;

//   // check if the requester is admin

//   const removed = await Chat.findByIdAndUpdate(
//     chatId,
//     {
//       $pull: { users: userId },
//     },
//     {
//       new: true,
//     }
//   )
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   if (!removed) {
//     res.status(404);
//     throw new Error("Chat Not Found");
//   } else {
//     res.json(removed);
//   }
// });

// // @desc    Add user to Group / Leave
// // @route   PUT /api/chat/groupadd
// // @access  Protected
//exports.addSomeoneToGroup = asyncHandler(async (req, res) => {
//   const { chatId, userId } = req.body;

//   // check if the requester is admin

//   const added = await Chat.findByIdAndUpdate(
//     chatId,
//     {
//       $push: { users: userId },
//     },
//     {
//       new: true,
//     }
//   )
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   if (!added) {
//     res.status(404);
//     throw new Error("Chat Not Found");
//   } else {
//     res.json(added);
//   }
// });
