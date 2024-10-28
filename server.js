const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const users = require("./api/users");
const chats = require("./api/chats");
const admin = require("./api/admin");

const messageSave = require("./actions/chats");

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
  },
});

// Set cors
app.use(
  cors({
    origin: "*",
  })
);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Use Routes
app.use("/api/users", users);
app.use("/api/chats", chats);
app.use("/api/admin", admin);

const port = process.env.PORT || require("./config/keys").port;

app.get("/", (req, res) => {
  res.json({ msg: `Server is running on ${port} for ChatBotAI.` });
});

// Store users and their respective sockets
const userlist = {};

// socket server part
io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("userJoined", (email) => {
    userlist[email] = socket.id;
    console.log(email, " joined");
  });

  socket.on("private-message", ({ receiverEmail, message }) => {
    const receiverSocketId = userlist[receiverEmail];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("private-message", {
        flag: false,
        message,
        email: receiverEmail,
        botFlag: false,
      });
    }
  });

  socket.on("sendMessage", async (message) => {
    const result = await messageSave(message);
    if (result === "success") {
      const aiResponse = await getAIResponse(message.message);

      if (aiResponse.includes(" sorry") || aiResponse.includes(" apologize")) {
        const receiverMessage = {
          flag: false,
          message:
            "I'm sorry if my response was incorrect. Let me contact to support team so they will provide a better response.",
          email: message.email,
          botFlag: false,
        };

        // save the receiver message in db
        const result = await messageSave(receiverMessage);

        socket.emit("receiveMessage", receiverMessage);

        notifySupportTeam(message, socket.id);
      } else {
        const receiverMessage = {
          flag: false,
          message: aiResponse,
          email: message.email,
          botFlag: true,
        };

        // save the receiver message in db
        const result = await messageSave(receiverMessage);

        if (result === "success") {
          socket.emit("receiveMessage", receiverMessage);
        } else {
          console.log("An error occurred!");
        }
      }
    } else {
      console.log("An error occurred!");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const getAIResponse = async (message) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${require("./config/keys").openAIAPIKey}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const notifySupportTeam = (message, socketId) => {
  // Logic to notify support team (could send a message in a support dashboard or email)
  console.log(
    `Support needed for message: ${message} from user with socket ID: ${socketId}`
  );
};

server.listen(port, () => console.log(`Server running on port ${port}`));
