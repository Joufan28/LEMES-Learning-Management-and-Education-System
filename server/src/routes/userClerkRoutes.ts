import express from "express";
import { updateUser } from "../controllers/userClerkController";
import { updateUserMetadata } from "../controllers/userClerkController";

const router = express.Router();

router.put("/:userId", updateUser);

// New route for metadata update
router.put("/:userId/metadata", updateUserMetadata);

export default router;
