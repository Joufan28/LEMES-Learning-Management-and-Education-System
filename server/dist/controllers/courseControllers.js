"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadVideoUrl = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourse = exports.listCourses = exports.updateTeacherInfoInCourses = void 0;
const courseModel_1 = __importDefault(require("../models/courseModel"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
const express_1 = require("@clerk/express");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const s3 = new aws_sdk_1.default.S3();
// Helper function to update teacher info in all their courses
const updateTeacherInfoInCourses = (teacherId, teacherBio, teacherJob) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get teacher's profile image URL from Clerk
        const teacherUser = yield clerk_sdk_node_1.clerkClient.users.getUser(teacherId);
        const teacherImageUrl = teacherUser.imageUrl || ""; // Assuming imageUrl property
        // Scan all courses
        const allCourses = yield courseModel_1.default.scan().exec();
        // Filter courses by teacherId
        const teacherCourses = allCourses.filter((course) => course.teacherId === teacherId);
        // Update bio, job, and image URL for each course
        for (const course of teacherCourses) {
            course.teacherBio = teacherBio;
            course.teacherJob = teacherJob;
            course.teacherImageUrl = teacherImageUrl; // Update image URL here
            yield course.save();
        }
        console.log(`[Backend] Updated teacher info and image URL for ${teacherCourses.length} courses for teacher ${teacherId}`);
    }
    catch (error) {
        console.error(`[Backend] Error updating teacher info and image URL in courses for teacher ${teacherId}:`, error);
    }
});
exports.updateTeacherInfoInCourses = updateTeacherInfoInCourses;
const listCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.query;
    try {
        const courses = category && category !== "all" ? yield courseModel_1.default.scan("category").eq(category).exec() : yield courseModel_1.default.scan().exec();
        res.json({ message: "Courses retrieved successfully", data: courses });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving courses", error });
    }
});
exports.listCourses = listCourses;
const getCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    console.log("Getting course with ID:", courseId);
    try {
        const course = yield courseModel_1.default.get(courseId);
        console.log("Retrieved course data:", course);
        if (!course) {
            console.log("Course not found for ID:", courseId);
            res.status(404).json({ message: "Course not found" });
            return;
        }
        res.json({ message: "Course retrieved successfully", data: course });
    }
    catch (error) {
        console.error("Error retrieving course:", error);
        res.status(500).json({ message: "Error retrieving course", error });
    }
});
exports.getCourse = getCourse;
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherId, teacherName, teacherBio, teacherJob } = req.body;
        if (!teacherId || !teacherName) {
            res.status(400).json({ message: "Teacher Id and name are required" });
            return;
        }
        // Get teacher's profile image URL from Clerk
        const teacherUser = yield clerk_sdk_node_1.clerkClient.users.getUser(teacherId);
        const teacherImageUrl = teacherUser.imageUrl || ""; // Assuming imageUrl property
        const newCourse = new courseModel_1.default({
            courseId: (0, uuid_1.v4)(),
            teacherId,
            teacherName,
            teacherBio: teacherBio || "",
            teacherJob: teacherJob || "",
            teacherImageUrl: teacherImageUrl,
            title: "Untitled Course",
            description: "",
            category: "Uncategorized",
            image: "",
            price: 0,
            level: "Beginner",
            status: "Draft",
            sections: [],
            enrollments: [],
        });
        yield newCourse.save();
        res.json({ message: "Course created successfully", data: newCourse });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating course", error });
    }
});
exports.createCourse = createCourse;
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const updateData = Object.assign({}, req.body);
    const { userId } = (0, express_1.getAuth)(req);
    try {
        const course = yield courseModel_1.default.get(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        if (course.teacherId !== userId) {
            res.status(403).json({ message: "Not authorized to update this course " });
            return;
        }
        // Handle image upload
        if (req.file) {
            const file = req.file;
            const uniqueId = (0, uuid_1.v4)();
            const s3Key = `course-thumbnails/${uniqueId}-${file.originalname}`;
            const s3Params = {
                Bucket: process.env.S3_BUCKET_NAME || "",
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read', // Make the image publicly accessible
            };
            try {
                const uploadedImage = yield s3.upload(s3Params).promise();
                updateData.image = uploadedImage.Location; // Store the S3 URL
                console.log(`[Backend] Uploaded thumbnail to S3: ${uploadedImage.Location}`);
            }
            catch (uploadError) {
                console.error("[Backend] Error uploading thumbnail to S3:", uploadError);
                res.status(500).json({ message: "Error uploading thumbnail image", error: uploadError });
                return;
            }
        }
        if (updateData.price) {
            const price = parseInt(updateData.price);
            if (isNaN(price)) {
                res.status(400).json({
                    message: "Invalid price format",
                    error: "Price must be a valid number",
                });
                return;
            }
            updateData.price = price * 100;
        }
        if (updateData.sections) {
            const sectionsData = typeof updateData.sections === "string" ? JSON.parse(updateData.sections) : updateData.sections;
            updateData.sections = sectionsData.map((section) => (Object.assign(Object.assign({}, section), { sectionId: section.sectionId || (0, uuid_1.v4)(), chapters: section.chapters.map((chapter) => (Object.assign(Object.assign({}, chapter), { chapterId: chapter.chapterId || (0, uuid_1.v4)() }))) })));
        }
        Object.assign(course, updateData);
        yield course.save();
        res.json({ message: "Course updated successfully", data: course });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating course", error });
    }
});
exports.updateCourse = updateCourse;
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const { userId } = (0, express_1.getAuth)(req);
    try {
        const course = yield courseModel_1.default.get(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        if (course.teacherId !== userId) {
            res.status(403).json({ message: "Not authorized to delete this course " });
            return;
        }
        yield courseModel_1.default.delete(courseId);
        res.json({ message: "Course deleted successfully", data: course });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting course", error });
    }
});
exports.deleteCourse = deleteCourse;
const getUploadVideoUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
        res.status(400).json({ message: "File name and type are required" });
        return;
    }
    try {
        const uniqueId = (0, uuid_1.v4)();
        const s3Key = `videos/${uniqueId}/${fileName}`;
        const s3Params = {
            Bucket: process.env.S3_BUCKET_NAME || "",
            Key: s3Key,
            Expires: 60,
            ContentType: fileType,
        };
        const uploadUrl = s3.getSignedUrl("putObject", s3Params);
        const videoUrl = `${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${fileName}`;
        res.json({
            message: "Upload URL generated successfully",
            data: { uploadUrl, videoUrl },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error generating upload URL", error });
    }
});
exports.getUploadVideoUrl = getUploadVideoUrl;
