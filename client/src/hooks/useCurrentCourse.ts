import { useGetCourseQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";

export const useCurrentCourse = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id") ?? "";
  console.log("Course ID from URL:", courseId);
  const { data: course, ...rest } = useGetCourseQuery(courseId);
  console.log("Course data from API:", course);

  return { course, courseId, ...rest };
};
