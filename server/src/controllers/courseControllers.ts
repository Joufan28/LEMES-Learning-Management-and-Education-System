import { Request, Response } from "express";
import Course from "../models/courseModel";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";

const s3 = new AWS.S3();

// Helper function to update teacher info in all their courses
export const updateTeacherInfoInCourses = async (
  teacherId: string,
  teacherBio: string,
  teacherJob: string
): Promise<void> => {
  try {
    // Get teacher's profile image URL from Clerk
    const teacherUser = await clerkClient.users.getUser(teacherId);
    const teacherImageUrl = teacherUser.imageUrl || ""; // Assuming imageUrl property

    // Scan all courses
    const allCourses = await Course.scan().exec();

    // Filter courses by teacherId
    const teacherCourses = allCourses.filter(
      (course) => course.teacherId === teacherId
    );

    // Update bio, job, and image URL for each course
    for (const course of teacherCourses) {
      course.teacherBio = teacherBio;
      course.teacherJob = teacherJob;
      course.teacherImageUrl = teacherImageUrl; // Update image URL here
      await course.save();
    }

    console.log(`[Backend] Updated teacher info and image URL for ${teacherCourses.length} courses for teacher ${teacherId}`);

  } catch (error) {
    console.error(`[Backend] Error updating teacher info and image URL in courses for teacher ${teacherId}:`, error);
  }
};

export const listCourses = async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query;
  try {
    const courses = category && category !== "all" ? await Course.scan("category").eq(category).exec() : await Course.scan().exec();
    res.json({ message: "Courses retrieved successfully", data: courses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses", error });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  console.log("Getting course with ID:", courseId);
  
  try {
    const course = await Course.get(courseId);
    console.log("Retrieved course data:", course);
    
    if (!course) {
      console.log("Course not found for ID:", courseId);
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.json({ message: "Course retrieved successfully", data: course });
  } catch (error) {
    console.error("Error retrieving course:", error);
    res.status(500).json({ message: "Error retrieving course", error });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId, teacherName, teacherBio, teacherJob } = req.body;

    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Teacher Id and name are required" });
      return;
    }

    // Get teacher's profile image URL from Clerk
    const teacherUser = await clerkClient.users.getUser(teacherId);
    const teacherImageUrl = teacherUser.imageUrl || ""; // Assuming imageUrl property

    const newCourse = new Course({
      courseId: uuidv4(),
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
    await newCourse.save();

    res.json({ message: "Course created successfully", data: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const updateData = { ...req.body };
  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);
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
      const file = req.file as Express.Multer.File;
      const uniqueId = uuidv4();
      const s3Key = `course-thumbnails/${uniqueId}-${file.originalname}`;

      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make the image publicly accessible
      };

      try {
        const uploadedImage = await s3.upload(s3Params).promise();
        updateData.image = uploadedImage.Location; // Store the S3 URL
        console.log(`[Backend] Uploaded thumbnail to S3: ${uploadedImage.Location}`);
      } catch (uploadError) {
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

      updateData.sections = sectionsData.map((section: any) => ({
        ...section,
        sectionId: section.sectionId || uuidv4(),
        chapters: section.chapters.map((chapter: any) => ({
          ...chapter,
          chapterId: chapter.chapterId || uuidv4(),
        })),
      }));
    }

    Object.assign(course, updateData);
    await course.save();

    res.json({ message: "Course updated successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.teacherId !== userId) {
      res.status(403).json({ message: "Not authorized to delete this course " });
      return;
    }

    await Course.delete(courseId);

    res.json({ message: "Course deleted successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
};

export const getUploadVideoUrl = async (req: Request, res: Response): Promise<void> => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    res.status(400).json({ message: "File name and type are required" });
    return;
  }

  try {
    const uniqueId = uuidv4();
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
  } catch (error) {
    res.status(500).json({ message: "Error generating upload URL", error });
  }
};
