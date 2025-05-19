import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { sequelize, initializeDatabase } from "./models/courseModel";

/* ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";

/* CONFIGURATIONS */
dotenv.config();
const isProduction = process.env.NODE_ENV === "production";

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/courses", courseRoutes);

// Database connection and server start
const startServer = async () => {
  try {
    await initializeDatabase();

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
};

startServer();
