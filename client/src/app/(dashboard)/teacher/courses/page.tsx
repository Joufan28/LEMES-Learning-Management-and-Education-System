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

  // Ekstrak kategori yang tersedia dari data kursus
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

  // Fungsi filter yang diperbaiki dengan penanganan error
  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    try {
      // Normalisasi teks pencarian dengan penanganan null/undefined
      const normalizedSearch = (searchTerm || "").trim().toLowerCase();

      return courses.filter((course: Course) => {
        // Pastikan title ada sebelum memanggil toLowerCase()
        const title = course.title || "";
        const matchesSearch = normalizedSearch ? title.toLowerCase().includes(normalizedSearch) : true;

        // Normalisasi kategori
        const normalizedCategory = selectedCategory === "all" ? true : course.category.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && normalizedCategory;
      });
    } catch (error) {
      console.error("Error filtering courses:", error);
      return courses; // Fallback ke semua kursus jika terjadi error
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

    const result = await createCourse({
      teacherId: user.id,
      teacherName: user.fullName || "Unknown Teacher",
    }).unwrap();

    router.push(`/teacher/courses/${result.courseId}`);
  };

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading courses.</div>;

  return (
    <div className="teacher-courses">
      <Header title="Courses" subtitle="Browse your courses" rightElement={<Button onClick={handleCreateCourse}>Create Course</Button>} />

      <Toolbar onSearch={setSearchTerm} onCategoryChange={setSelectedCategory} searchValue={searchTerm} selectedCategory={selectedCategory} categories={availableCategories} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => <TeacherCourseCard key={course.courseId} course={course} onEdit={() => handleEdit(course)} onDelete={() => handleDelete(course.courseId)} isOwner={course.teacherId === user?.id} />)
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No courses found</p>
            <Button className="mt-4" onClick={handleCreateCourse}>
              Create Your First Course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
