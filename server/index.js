const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

require("dotenv").config();
//route imports
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const chatbotRoutes = require("./routes/chatbot");
const userRoutes = require("./routes/user");

const app = express();

//Cors policy

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",")
const corsOption = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS, hehe!"));
      }
    },
    methods: "GET,POST,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  };



// Middleware
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/user", userRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
