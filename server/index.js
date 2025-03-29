require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

//route imports
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const chatbotRoutes = require("./routes/chatbot");
const userRoutes = require("./routes/user");

const app = express();

//CORS policy
const corsOption = {
    origin: "http://localhost:5173",
    credentials: true,
    optionSuccessStatus: 200,
}

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
