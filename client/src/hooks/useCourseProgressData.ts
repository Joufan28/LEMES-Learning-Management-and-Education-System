import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useGetCourseQuery, useGetUserCourseProgressQuery, useUpdateUserCourseProgressMutation } from "@/state/api";
import { useUser } from "@clerk/nextjs";

export const useCourseProgressData = () => {
  const { courseId, chapterId } = useParams();
  const searchParams = useSearchParams();
  const viewAsTeacher = searchParams.get('viewAsTeacher') === 'true';
  const { user, isLoaded } = useUser();
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [updateProgress] = useUpdateUserCourseProgressMutation();

  const { data: courseData, isLoading: courseLoading } = useGetCourseQuery((courseId as string) ?? "", {
    skip: !courseId,
  });

  const course = courseData?.data || [];

  const { data: userProgress, isLoading: progressLoading } = useGetUserCourseProgressQuery(
    {
      userId: user?.id ?? "",
      courseId: (courseId as string) ?? "",
    },
    {
      skip: !isLoaded || !user || !courseId || viewAsTeacher,
    }
  );

  const isLoading = !isLoaded || courseLoading || progressLoading;

  const currentSection = course?.sections?.find((s: Section) => s.chapters.some((c: Chapter) => c.chapterId === chapterId));

  const currentChapter = currentSection?.chapters.find((c: Chapter) => c.chapterId === chapterId);

  const isChapterCompleted = () => {
    if (!currentSection || !currentChapter || !userProgress || !userProgress.sections) return false;

    const section = userProgress.sections.find((s) => s.sectionId === currentSection.sectionId);
    return section?.chapters.some((c) => c.chapterId === currentChapter.chapterId && c.completed) ?? false;
  };

  const updateChapterProgress = (sectionId: string, chapterId: string, completed: boolean) => {
    if (!user || viewAsTeacher) return;

    const updatedSections = [
      {
        sectionId,
        chapters: [
          {
            chapterId,
            completed,
          },
        ],
      },
    ];

    updateProgress({
      userId: user.id,
      courseId: (courseId as string) ?? "",
      progressData: {
        sections: updatedSections,
      },
    });
  };

  return {
    user,
    courseId,
    chapterId,
    course,
    userProgress,
    currentSection,
    currentChapter,
    isLoading,
    isChapterCompleted,
    updateChapterProgress,
    hasMarkedComplete,
    setHasMarkedComplete,
  };
};
