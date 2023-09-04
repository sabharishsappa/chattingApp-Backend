const express = require("express");
const chats = require("./data/data.js");
const dotenv = require("dotenv");
const connectdb = require("./config/db.js");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const errorHandler = require("./middlewares/errorController.js");
const cors = require("cors");
const authController = require("./controllers/authController.js");
const messageRoutes = require("./routes/messageRoutes.js");
const path = require("path");

dotenv.config();

const app = express();

app.use(express.json()); //Body Parser

// Set allowed origins (replace "http://localhost:3001" with your frontend domain)
const allowedOrigins = ["http://localhost:3000", "https://example.com"];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors());

connectdb();

app.get("/", (req, res) => {
  res.send("Welcome to chat api");
});

app.use("/api/user", userRoutes);
app.use("/api/user/login", authController.login);
app.use("/api/chats", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(errorHandler.notFound);
app.use(errorHandler.errorHandler);

// ------------------------------------------>Deployment
// const __dirname1 = path.resolve();
// if(process.env === "production")

// ------------------------------------------>Deployment

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
