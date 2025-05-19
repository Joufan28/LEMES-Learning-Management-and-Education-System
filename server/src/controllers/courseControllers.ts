import { Request, Response } from "express";
import { Course, Section, Chapter, Comment } from "../models/courseModel";

export const listCourses = async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query;

  try {
    const whereClause: { category?: string } = {};

    if (category && typeof category === "string" && category !== "all") {
      whereClause.category = category;
    }

    const courses = await Course.findAll({
      where: whereClause,
      include: [
        {
          model: Section,
          as: "sections",
          include: [
            {
              model: Chapter,
              as: "chapters",
              include: [
                {
                  model: Comment,
                  as: "comments",
                },
              ],
            },
          ],
        },
      ],
    });

    res.json({ message: "Courses retrieved successfully", data: courses });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving courses",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;

  try {
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Section,
          as: "sections",
          include: [
            {
              model: Chapter,
              as: "chapters",
              include: [
                {
                  model: Comment,
                  as: "comments",
                },
              ],
            },
          ],
        },
      ],
    });

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.json({ message: "Course retrieved successfully", data: course });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving course",
      error: error instanceof Error ? error.message : error,
    });
  }
};
