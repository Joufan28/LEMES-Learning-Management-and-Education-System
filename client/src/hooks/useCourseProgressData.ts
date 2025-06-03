import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useGetCourseQuery, useGetUserCourseProgressQuery, useUpdateUserCourseProgressMutation } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import type { Chapter, Section, UserCourseProgress } from "@/lib/schemas";

interface SectionProgress {
  sectionId: string;
  chapters: Array<{
    chapterId: string;
    completed: boolean;
  }>;
}

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

  const course = courseData?.data;

  const { data: userProgressData, isLoading: progressLoading } = useGetUserCourseProgressQuery(
    {
      userId: user?.id ?? "",
      courseId: (courseId as string) ?? "",
    },
    {
      skip: !isLoaded || !user || !courseId || viewAsTeacher,
    }
  );

  const userProgress = userProgressData?.data;

  const isLoading = !isLoaded || courseLoading || progressLoading;

  const currentSection = course?.sections?.find((s: Section) => s.chapters.some((c: Chapter) => c.chapterId === chapterId));

  const currentChapter = currentSection?.chapters.find((c: Chapter) => c.chapterId === chapterId);

  const isChapterCompleted = () => {
    if (!currentSection || !currentChapter || !userProgress) return false;

    const section = userProgress.sections.find((s: SectionProgress) => s.sectionId === currentSection.sectionId);
    return section?.chapters.some((c: { chapterId: string; completed: boolean }) => c.chapterId === currentChapter.chapterId && c.completed) ?? false;
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
