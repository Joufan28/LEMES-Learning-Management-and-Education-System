import express from "express";
import { updateUserMetadata } from "../controllers/userClerkController";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Route to update public metadata
router.put("/:userId/metadata", requireAuth(), updateUserMetadata);

export default router; 