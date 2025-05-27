import express from "express";
import { listCourses, getCourse, updateCourse, createCourse, deleteCourse } from "../controllers/courseControllers";
import { requireAuth } from "@clerk/express";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", listCourses);
router.get("/:courseId", getCourse);
router.post("/", requireAuth(), createCourse);
router.put("/:courseId", requireAuth(), upload.single("image"), updateCourse);
router.delete("/:courseId", requireAuth(), deleteCourse);

export default router;
