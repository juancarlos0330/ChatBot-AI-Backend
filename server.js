const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const users = require("./api/users");

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

const port = process.env.PORT || require("./config/keys").port;

app.get("/", (req, res) => {
  res.json({ msg: `Server is running on ${port} for ChatBotAI.` });
});

// socket server part
io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("sendMessage", async (message) => {
    const aiResponse = await getAIResponse(message.message);

    if (!aiResponse) {
      notifySupportTeam(message, socket.id);
    } else {
      socket.emit("receiveMessage", {
        flag: false,
        message: aiResponse,
      });
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
    console.log(response.data);
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
