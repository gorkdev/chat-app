import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Message from "./models/message.js";
import User from "./models/user.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // frontend'in URL'si burada
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Debug environment variables
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/chat-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Set all users to offline when server starts
    try {
      await User.updateMany({}, { isOnline: false, socketId: null });
      console.log("All users set to offline");
    } catch (err) {
      console.error("Error setting users offline:", err);
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Heartbeat check - set user offline if connection is lost
  const heartbeatInterval = setInterval(async () => {
    try {
      const user = await User.findOne({ socketId: socket.id });
      if (user && user.isOnline) {
        // User is still online, everything is normal
        return;
      }
    } catch (err) {
      console.error("Heartbeat check error:", err);
    }
  }, 30000); // Check every 30 seconds

  // User login/registration
  socket.on("user_auth", async (data) => {
    try {
      console.log("Received auth data:", data);
      const { username, password, action } = data; // action: 'login' or 'register'
      console.log("Auth action:", action, "Username:", username);

      // Username validation
      const existingUser = await User.findOne({ username: username });
      console.log("Existing user found:", existingUser ? "Yes" : "No");

      if (action === "login") {
        if (!existingUser) {
          socket.emit("auth_error", {
            message: "User not found!",
            needPassword: false,
          });
          return;
        }

        // Password validation
        if (!password || password.trim() === "") {
          socket.emit("auth_error", {
            message: "Password required!",
            needPassword: true,
          });
          return;
        }

        const isPasswordValid = await existingUser.comparePassword(password);
        if (!isPasswordValid) {
          socket.emit("auth_error", {
            message: "Wrong password!",
            needPassword: true,
          });
          return;
        }

        // Is user already online?
        if (existingUser.isOnline) {
          socket.emit("auth_error", {
            message: "This user is already online!",
            needPassword: false,
          });
          return;
        }

        // Login successful - set user online
        existingUser.socketId = socket.id;
        existingUser.isOnline = true;
        existingUser.loginTime = new Date();
        await existingUser.save();

        socket.emit("auth_success", {
          message: "Login successful!",
          username: username,
        });

        // Notify all clients about user joining
        io.emit("user_joined", {
          username: username,
        });

        console.log(`User logged in: ${username}`);
      } else if (action === "register") {
        console.log("Processing registration for:", username);

        if (existingUser) {
          console.log("Username already exists, sending error");
          socket.emit("auth_error", {
            message: "This username is already taken!",
            needPassword: false,
          });
          return;
        }

        // Password validation
        if (!password || password.trim() === "") {
          console.log("Password missing, sending error");
          socket.emit("auth_error", {
            message: "Password required!",
            needPassword: true,
          });
          return;
        }

        if (password.length < 6) {
          console.log("Password too short, sending error");
          socket.emit("auth_error", {
            message: "Password must be at least 6 characters!",
            needPassword: true,
          });
          return;
        }

        console.log("Creating new user...");
        // Create new user
        const newUser = new User({
          username: username,
          password: password,
          socketId: socket.id,
          isOnline: true,
        });

        console.log("Saving user to database...");
        const savedUser = await newUser.save();
        console.log("User saved to DB successfully:", savedUser);

        socket.emit("auth_success", {
          message: "Registration successful!",
          username: username,
        });

        // Notify all clients about user joining
        io.emit("user_joined", {
          username: username,
        });

        console.log(`New user registered: ${username}`);
      }
    } catch (err) {
      console.error("Auth error:", err);

      let errorMessage = "An error occurred!";
      if (err.name === "ValidationError") {
        if (err.errors.password) {
          errorMessage = "Password must be at least 6 characters!";
        } else if (err.errors.username) {
          errorMessage = "Username must be 3-20 characters!";
        }
      } else if (err.code === 11000) {
        errorMessage = "This username is already taken!";
      }

      socket.emit("auth_error", {
        message: errorMessage,
        needPassword: false,
      });
    }
  });

  // User reconnection
  socket.on("user_reconnect", async (data) => {
    try {
      const { username } = data;
      const user = await User.findOne({ username: username });

      if (user) {
        // Update user's socket ID and online status
        user.socketId = socket.id;
        user.isOnline = true;
        user.loginTime = new Date();
        await user.save();

        console.log(`User reconnected: ${username}`);

        // Notify all clients about user reconnection
        io.emit("user_joined", {
          username: username,
        });
      }
    } catch (err) {
      console.error("Reconnect error:", err);
    }
  });

  // Username check
  socket.on("check_username", async (data) => {
    try {
      const { username } = data;
      const existingUser = await User.findOne({ username: username });

      if (existingUser) {
        socket.emit("username_exists", {
          exists: true,
          message: "This username is already taken. Enter your password:",
        });
      } else {
        socket.emit("username_available", {
          exists: false,
          message: "Username is available. Create a password:",
        });
      }
    } catch (err) {
      console.error("Username check error:", err);
      socket.emit("username_check_error", {
        message: "Could not check username!",
      });
    }
  });

  // Save message to DB and send to everyone when message is sent
  socket.on("send_message", async (data) => {
    try {
      console.log("Received message:", data);
      console.log("Message data type:", typeof data);
      console.log("Message data keys:", Object.keys(data));

      const newMessage = new Message(data);
      console.log("Created message object:", newMessage);

      const savedMessage = await newMessage.save();
      console.log("Message saved to DB successfully:", savedMessage);

      io.emit("receive_message", data);
      console.log("Message broadcasted to all clients");
    } catch (err) {
      console.error("Could not save message:", err);
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
    }
  });

  socket.on("disconnect", async () => {
    try {
      // Clear heartbeat interval
      clearInterval(heartbeatInterval);

      // Set user offline (don't delete, just set offline)
      const user = await User.findOneAndUpdate(
        { socketId: socket.id },
        { isOnline: false, socketId: null },
        { new: true }
      );

      if (user) {
        // Notify other users that user left
        socket.broadcast.emit("user_left", {
          username: user.username,
        });
        console.log(`User went offline: ${user.username}`);
      }
    } catch (err) {
      console.error("User offline error:", err);
    }
  });
});

// API Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Get messages (with pagination)
app.get("/api/messages", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      messages: messages.reverse(), // Oldest messages first
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get online users
app.get("/api/users/online", async (req, res) => {
  try {
    const users = await User.find({ isOnline: true })
      .select("username loginTime")
      .sort({ loginTime: -1 })
      .lean();

    res.json({ users });
  } catch (err) {
    console.error("Error fetching online users:", err);
    res.status(500).json({ error: "Failed to fetch online users" });
  }
});

// Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
