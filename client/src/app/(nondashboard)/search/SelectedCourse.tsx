import AccordionSections from "@/components/AccrodionSections";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { useGetUserEnrolledCoursesQuery } from "@/state/api";
import { motion } from "framer-motion";
import { Clock, Users, BookOpen, ArrowRight } from "lucide-react";
import type { Course } from "@/lib/schemas";
import { useRouter, useSearchParams } from "next/navigation";

interface SelectedCourseProps {
  course: Course;
  handleEnrollNow: (courseId: string) => void;
}

const SelectedCourse: React.FC<SelectedCourseProps> = ({ course, handleEnrollNow }) => {
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const userRole = user?.publicMetadata?.userType as "student" | "teacher" | undefined;
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: enrolledCoursesData, isLoading: isLoadingEnrolledCourses } = useGetUserEnrolledCoursesQuery(userId as string, {
    skip: !userId || !isLoaded
  });
  const enrolledCourses = enrolledCoursesData?.data || [];

  const isOwnedByTeacher = userRole === "teacher" && course.teacherId === userId;
  const isAlreadyEnrolled = enrolledCourses.some((enrolledCourse) => enrolledCourse.courseId === course.courseId);
  const disableEnroll = isOwnedByTeacher || isAlreadyEnrolled;

  const handleBackToSearch = () => {
    router.push('/search');
  };

  return (
    <div className="selected-course">
      {id && (
        <Button
          variant="link"
          onClick={handleBackToSearch}
          className="mb-4 p-0 text-primary-700 hover:text-primary-600"
        >
          ← Back to All Courses
        </Button>
      )}

      <div>
        <h3 className="selected-course__title">{course.title}</h3>
        <p className="selected-course__author">
          By {course.teacherName} | {""} <span className="selected-course__enrollment-count">{course?.enrollments?.length}</span>
        </p>
      </div>

      <div className="selected-course__content">
        <p className="selected-course__description">{course.description}</p>

        <div className="selected-course__sections">
          <h4 className="selected-course__sections-title">Course Content</h4>
          {/* {Accordion Sections} */}
          <AccordionSections sections={course.sections} />
        </div>

        <div className="selected-course__footer">
          <span className="selected-course__price">{formatPrice(course.price)}</span>
          <Button
            onClick={() => handleEnrollNow(course.courseId)}
            className="bg-primary-700 hover:bg-primary-600"
            disabled={disableEnroll}
          >
            {disableEnroll ? (isOwnedByTeacher ? 'Your Course' : 'Already Enrolled') : 'Enroll Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectedCourse;
