const asyncHandler = require("express-async-handler");
const User = require("./../models/userModel");

exports.allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  // console.log(req);
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});
