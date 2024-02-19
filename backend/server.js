const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
connectDB();
app.use(helmet());


app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/user",userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`));

const io = require("socket.io")(server,{
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
})

io.on("connection",(socket)=> {
  console.log("connected to socket.io");


  // UserID room
  socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
  })

  // Whenever a user joins a chat

  socket.on('join chat', (roomId) => {
    socket.join(roomId);
    console.log("User Joined Room: " + roomId);
  })

  //Socket for typing

  socket.on('typing', (room) => {
    socket.in(room).emit("typing")
  })

  //Socket for stop typing
  socket.on('stop typing', (room) => {
    socket.in(room).emit("stop typing")
  })


  //Real time notification socket
  socket.on('new message', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat || !chat.users) {
      console.log("Chat or chat.users not defined");
      return;
    }


    chat.users.forEach((user) => {
      if(user._id == newMessageRecieved.sender._id) return ;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  })

  socket.off("setup", () => {
    console.log("USER DISCCONNECTED");
    socket.leave(userData._id);
  })
})

