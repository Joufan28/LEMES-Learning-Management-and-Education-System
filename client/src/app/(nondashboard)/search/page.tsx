"use client";

import Loading from "@/components/Loading";
import { useGetCoursesQuery } from "@/state/api";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CourseCardSearch from "@/components/CourseCardSearch";
import SelectedCourse from "./SelectedCourse";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search as SearchIcon } from "lucide-react";

const Search = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { data, isLoading, isError } = useGetCoursesQuery({});
  const courses = data?.data ?? [];
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  useEffect(() => {
    if (courses) {
      if (id) {
        const course = courses.find((c) => c.courseId === id);
        setSelectedCourse(course || courses[0]);
      } else {
        setSelectedCourse(courses[0]);
      }
    }
  }, [courses, id]);

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Failed to fetch courses</div>;

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    router.push(`/search?id=${course.courseId}`, {
      scroll: false,
    });
  };

  const handleEnrollNow = (courseId: string) => {
    router.push(`/checkout?step=1&id=${courseId}&showSignUp=false`, {
      scroll: false,
    });
  };

  // Filter courses based on search and filter options
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter logic based on selected option
    switch (filterOption) {
      case "popular":
        return matchesSearch && course.enrollments?.length > 10;
      case "new":
        return matchesSearch && course.isNew;
      case "beginner":
        return matchesSearch && course.level === "Beginner";
      case "advanced":
        return matchesSearch && course.level === "Advanced";
      default: // "all"
        return matchesSearch;
    }
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="search">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="search__title">List of available courses</h1>
          <h2 className="search__subtitle">{filteredCourses.length} courses available</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Courses</option>
                <option value="popular">Popular</option>
                <option value="new">New Releases</option>
                <option value="beginner">Beginner</option>
                <option value="advanced">Advanced</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="search__content">
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="search__courses-grid">
          {filteredCourses.map((course) => (
            <CourseCardSearch key={course.courseId} course={course} isSelected={selectedCourse?.courseId === course.courseId} onClick={() => handleCourseSelect(course)} />
          ))}
        </motion.div>

        {selectedCourse && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="search__selected-course">
            <SelectedCourse course={selectedCourse} handleEnrollNow={handleEnrollNow} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Search;
