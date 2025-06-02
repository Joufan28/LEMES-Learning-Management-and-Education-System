import express from "express";
import { listCourses, getCourse, updateCourse, createCourse, deleteCourse, getUploadVideoUrl } from "../controllers/courseControllers";
import { requireAuth } from "@clerk/express";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route('/').get(listCourses).post(requireAuth(), createCourse);
router.route('/:courseId').get(getCourse).put(requireAuth(), upload.single('image'), updateCourse).delete(requireAuth(), deleteCourse);

router.route('/upload-video-url').post(requireAuth(), getUploadVideoUrl);

export default router;
