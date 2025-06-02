"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import TeacherCourseCard from "@/components/TeacherCourseCard";
import Toolbar from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import { useCreateCourseMutation, useDeleteCourseMutation, useGetCoursesQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, useEffect } from "react";

interface Course {
  courseId: string;
  title: string;
  category: string;
  teacherId: string;
  teacherName: string;
  teacherBio?: string;
  teacherJob?: string;
  image?: string;
  status: "Published" | "Draft";
  enrollments?: any[]; // simplified
  sections?: { chapters: { chapterId: string }[] }[]; // simplified to get first chapter
}

const Courses = () => {
  const router = useRouter();
  const { user } = useUser();
  const { data: coursesData, isLoading, isError } = useGetCoursesQuery({});
  const courses = coursesData?.data || [];

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Extract available categories from course data
  useEffect(() => {
    if (courses.length > 0) {
      const uniqueCategories = new Set<string>();

      courses.forEach((course: Course) => {
        if (course.category) {
          uniqueCategories.add(course.category);
        }
      });

      setAvailableCategories(["all", ...Array.from(uniqueCategories)]);
    }
  }, [courses]);

  // Filter courses based on search and filter options
  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    try {
      const normalizedSearch = (searchTerm || "").trim().toLowerCase();

      return courses.filter((course: Course) => {
        const title = course.title || "";
        const matchesSearch = normalizedSearch ? title.toLowerCase().includes(normalizedSearch) : true;

        const normalizedCategory = selectedCategory === "all" ? true : course.category.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && normalizedCategory;
      });
    } catch (error) {
      console.error("Error filtering courses:", error);
      return courses; // Fallback to all courses if error occurs
    }
  }, [courses, searchTerm, selectedCategory]);

  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.courseId}`);
  };

  const handleDelete = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      await deleteCourse(courseId).unwrap();
    }
  };

  const handleCreateCourse = async () => {
    if (!user) return;

    const metadata = user.publicMetadata as { bio?: string; job?: string };

    const result = await createCourse({
      teacherId: user.id,
      teacherName: user.fullName || "Unknown Teacher",
      teacherBio: metadata?.bio || "",
      teacherJob: metadata?.job || "",
    }).unwrap();

    router.push(`/teacher/courses/${result.courseId}`);
  };

  const handleViewCourse = (course: Course) => {
    console.log("Attempting to view course:", course.courseId);
    console.log("Course object:", course);
    if (course.sections && course.sections.length > 0 && course.sections[0].chapters && course.sections[0].chapters.length > 0) {
      const firstChapterId = course.sections[0].chapters[0].chapterId;
      console.log("Found first chapter ID:", firstChapterId);
      const viewUrl = `/user/courses/${course.courseId}/chapters/${firstChapterId}?viewAsTeacher=true`;
      console.log("Navigating to:", viewUrl);
      router.push(viewUrl);
    } else {
      console.log("Course has no sections or chapters to view.", course.courseId);
      // Optionally handle courses with no chapters, e.g., navigate to a basic course page or show a message
      // router.push(`/user/courses/${course.courseId}?viewAsTeacher=true`); // Example if a basic page exists
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading courses.</div>;

  return (
    <div className="teacher-courses container">
      <Header title="Courses" subtitle="Browse your courses" rightElement={<Button onClick={handleCreateCourse} className="teacher-courses__header">Create Course</Button>} />

      <Toolbar onSearch={setSearchTerm} onCategoryChange={setSelectedCategory} searchValue={searchTerm} selectedCategory={selectedCategory} categories={availableCategories} />

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-4">No courses match your filters</h3>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredCourses.map((course) => (
            <TeacherCourseCard
              key={course.courseId}
              course={course}
              onEdit={() => handleEdit(course)}
              onDelete={() => handleDelete(course.courseId)}
              isOwner={course.teacherId === user?.id}
              onViewCourse={() => handleViewCourse(course)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
