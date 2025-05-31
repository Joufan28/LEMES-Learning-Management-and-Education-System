"use client";

import Toolbar from "@/components/Toolbar";
import CourseCard from "@/components/CourseCard";
import { useGetUserEnrolledCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo, useEffect } from "react";
import Loading from "@/components/Loading";

const Courses = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const { data, isLoading, isError } = useGetUserEnrolledCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user,
  });

  const courses = data?.data || [];

  // Ekstrak kategori yang tersedia dari data kursus dengan penanganan null-safe
  useEffect(() => {
    if (courses.length > 0) {
      const uniqueCategories = new Set<string>();

      courses.forEach((course) => {
        // Gunakan kategori dari berbagai kemungkinan properti
        const category = course.category || course.categoryName || "";
        if (category) {
          uniqueCategories.add(category);
        }
      });

      setAvailableCategories(["all", ...Array.from(uniqueCategories)]);
    }
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    // Normalisasi searchTerm dengan penanganan nilai null/undefined
    const normalizedSearch = (searchTerm || "").trim().toLowerCase();

    return courses.filter((course) => {
      // Pastikan title ada sebelum memanggil toLowerCase()
      const title = course.title || "";
      const matchesSearch = normalizedSearch ? title.toLowerCase().includes(normalizedSearch) : true;

      // Ambil kategori dari berbagai sumber
      const courseCategory = course.category || course.categoryName || "";
      const normalizedCategory = courseCategory.toLowerCase();

      const matchesCategory = selectedCategory === "all" ? true : normalizedCategory === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleGoToCourse = (course: any) => {
    // Tambahkan pengecekan untuk menghindari error jika struktur tidak sesuai
    try {
      if (course.sections?.[0]?.chapters?.[0]?.chapterId) {
        const firstChapter = course.sections[0].chapters[0];
        router.push(`/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`);
      } else {
        router.push(`/user/courses/${course.courseId}`);
      }
    } catch (error) {
      console.error("Error navigating to course:", error);
      router.push(`/user/courses/${course.courseId}`);
    }
  };

  if (!isLoaded || isLoading) return <Loading />;

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please sign in to view your courses</h2>
          <button onClick={() => router.push("/signin")} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </button>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Error loading courses</h2>
          <p className="text-gray-600 mb-6">Please try again later</p>
          <button onClick={() => window.location.reload()} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Retry
          </button>
        </div>
      </div>
    );

  if (!courses || courses.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">You are not enrolled in any courses yet</h2>
          <button onClick={() => router.push("/search")} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Browse Courses
          </button>
        </div>
      </div>
    );

  return (
    <div className="user-courses container">
      <Header title="My Learning" subtitle="Your enrolled courses" />

      <Toolbar onSearch={setSearchTerm} onCategoryChange={setSelectedCategory} categories={availableCategories} selectedCategory={selectedCategory} />

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
            <CourseCard key={course.courseId} course={course} onGoToCourse={() => handleGoToCourse(course)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
