import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import serverless from "serverless-http";
import seed from "./seed/seedDynamodb";
import { clerkMiddleware, createClerkClient, requireAuth } from "@clerk/express";
// /* ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgressRoutes";

/* CONFIGURATIONS */
dotenv.config();
const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  dynamoose.aws.ddb.local();
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const app = express();

// Log incoming request path
app.use((req, res, next) => {
  console.log(`[Backend] Received request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Configure CORS to allow credentials from specific origin
app.use(cors({ origin: ["https://lemes-learning-management-and-educa-delta.vercel.app/", "https://lemes-learning-management-and-educa-delta.vercel.app"], credentials: true }));
app.use(clerkMiddleware());

// Log Clerk related information
app.use((req: any, res, next) => {
  console.log(`[Backend] CLERK_SECRET_KEY is set: ${!!process.env.CLERK_SECRET_KEY}`);
  console.log(`[Backend] req.auth after clerkMiddleware:`, req.auth);
  try {
    console.log(`[Backend] Result of req.auth():`, req.auth());
  } catch (e) {
    console.log(`[Backend] Error calling req.auth():`, e);
  }
  next();
});

/* ROUTES */
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users/clerk", requireAuth(), userClerkRoutes);
app.use("/courses", courseRoutes);
app.use("/transactions", requireAuth(), transactionRoutes);
app.use("/users/course-progress", requireAuth(), userCourseProgressRoutes);

/* SERVER */
const port = process.env.PORT || 3000;
if (!isProduction) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// aws production environment
const serverlessApp = serverless(app);
export const handler = async (event: any, context: any) => {
  if (event.action === "seed") {
    await seed();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data seeded successfully" }),
    };
  } else {
    return serverlessApp(event, context);
  }
};
