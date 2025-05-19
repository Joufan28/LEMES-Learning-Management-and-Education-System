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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourse = exports.listCourses = void 0;
const courseModel_1 = require("../models/courseModel");
const listCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.query;
    try {
        const whereClause = {};
        if (category && typeof category === "string" && category !== "all") {
            whereClause.category = category;
        }
        const courses = yield courseModel_1.Course.findAll({
            where: whereClause,
            include: [
                {
                    model: courseModel_1.Section,
                    as: "sections",
                    include: [
                        {
                            model: courseModel_1.Chapter,
                            as: "chapters",
                            include: [
                                {
                                    model: courseModel_1.Comment,
                                    as: "comments",
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        res.json({ message: "Courses retrieved successfully", data: courses });
    }
    catch (error) {
        res.status(500).json({
            message: "Error retrieving courses",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.listCourses = listCourses;
const getCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    try {
        const course = yield courseModel_1.Course.findByPk(courseId, {
            include: [
                {
                    model: courseModel_1.Section,
                    as: "sections",
                    include: [
                        {
                            model: courseModel_1.Chapter,
                            as: "chapters",
                            include: [
                                {
                                    model: courseModel_1.Comment,
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
    }
    catch (error) {
        res.status(500).json({
            message: "Error retrieving course",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.getCourse = getCourse;
