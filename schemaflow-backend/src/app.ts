import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./utils/logger";
import projectRoutes from "./routes/projectRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  logger.info(`[${req.method}] ${req.url}`);
  next();
});

// Base Route
app.get("/", (req, res) => {
  logger.info("Health check route accessed");
  res.send("Welcome to the Database Schema Generator API!");
});

//routes
app.use("/", projectRoutes);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
