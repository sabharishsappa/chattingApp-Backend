const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");

const asyncHandler = require("express-async-handler");

const createJWTtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.signUp = asyncHandler(async (req, res) => {
  const { name, email, password, profilePic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All the Fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) throw new Error("User already exists with that Email");
  const user = await User.create({ name, email, password, profilePic });

  if (!user) {
    res.status(400);
    throw new Error("Error in Creating New User");
  }

  const jwtToken = createJWTtoken(user._id);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    profilePic: user.profilePic,
    jwtToken,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract the token from the authorization header
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } else {
      res.status(401);
      throw new Error("Authorization token not found");
    }
  } catch (err) {
    res.status(401);
    throw new Error("Error Occurred in Authorization - " + err.message);
  }
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.correctPassword(password, user.password))) {
    const jwtToken = createJWTtoken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profilePic: user.profilePic,
      jwtToken,
    });
  } else {
    throw new Error("Incorrect Login credentials");
  }
});
