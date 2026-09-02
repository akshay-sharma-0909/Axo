import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================
// CORS
// =====================================

app.use(
  cors({
    origin: [  "http://localhost:5173" , "https://frontend-f83gy09mo-akshay-ee87.vercel.app/"
],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// =====================================
// JSON BODY
// =====================================

app.use(express.json());

// =====================================
// ROOT HEALTH CHECK
// =====================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Axonite backend is running",
  });
});

// =====================================
// API HEALTH CHECK
// =====================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// =====================================
// CONTACT ROUTES
// =====================================

app.use("/api", contactRoutes);

// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// =====================================
// SERVER ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
  console.log(
    `Axonite backend running on http://localhost:${PORT}`
  );
});
