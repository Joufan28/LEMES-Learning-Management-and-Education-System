"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseControllers_1 = require("../controllers/courseControllers");
const express_2 = require("@clerk/express");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.route('/').get(courseControllers_1.listCourses).post((0, express_2.requireAuth)(), courseControllers_1.createCourse);
router.route('/:courseId').get(courseControllers_1.getCourse).put((0, express_2.requireAuth)(), upload.single('image'), courseControllers_1.updateCourse).delete((0, express_2.requireAuth)(), courseControllers_1.deleteCourse);
router.route('/upload-video-url').post((0, express_2.requireAuth)(), courseControllers_1.getUploadVideoUrl);
exports.default = router;
