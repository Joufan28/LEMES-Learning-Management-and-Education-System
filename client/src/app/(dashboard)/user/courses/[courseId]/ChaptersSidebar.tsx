import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, FileText, CheckCircle, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import Loading from "@/components/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";
import type { Chapter, ChapterProgress } from "@/lib/schemas";

interface SectionType {
  sectionId: string;
  sectionTitle: string;
  sectionDescription?: string;
  chapters: Chapter[];
}

interface CourseType {
  courseId: string;
  title: string;
  sections: SectionType[];
  // Add other necessary fields from Course type
}

interface SectionProgressType {
  sectionId: string;
  chapters: ChapterProgress[];
}

interface UserCourseProgressType {
  userId: string;
  courseId: string;
  sections: SectionProgressType[];
  // Add other necessary fields from UserCourseProgress type
}

interface ChaptersSidebarProps {
  isViewAsTeacher: boolean;
  userProgress: UserCourseProgressType | undefined; // Allow undefined
}

const ChaptersSidebar: React.FC<ChaptersSidebarProps> = ({ isViewAsTeacher, userProgress }) => {
  const router = useRouter();
  const { setOpen } = useSidebar();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Use useCourseProgressData to get course data, but userProgress will come from props
  const { user, course, chapterId, courseId, isLoading, updateChapterProgress } = useCourseProgressData();

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Adjusted loading/error state check
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Memuat data kursus...</div>;
  }

  if (!user) {
    return <div>Please sign in to view this course.</div>;
  }

  if (!course) {
    return <div>Error loading course content</div>;
  }

  // Add explicit check to ensure course is a valid object before accessing properties
  if (Array.isArray(course) || typeof course !== 'object') {
      console.error("Unexpected state: course in ChaptersSidebar is not a valid Course object.", course);
      return <div>Error: Invalid course data in sidebar.</div>; // Handle this state appropriately
  }

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prevSections) => (prevSections.includes(sectionTitle) ? prevSections.filter((title) => title !== sectionTitle) : [...prevSections, sectionTitle]));
  };

  const handleChapterClick = (sectionId: string, chapterId: string) => {
    // When clicking a chapter in view as teacher mode, stay in view as teacher mode
    const url = `/user/courses/${courseId}/chapters/${chapterId}${isViewAsTeacher ? '?viewAsTeacher=true' : ''}`;
    router.push(url, {
      scroll: false,
    });
  };

  return (
    <div ref={sidebarRef} className="chapters-sidebar">
      <div className="chapters-sidebar__header">
        <h2 className="chapters-sidebar__title">{course.title}</h2>
        <hr className="chapters-sidebar__divider" />
      </div>
      {/* Use CourseType for mapping sections */}
      {course?.sections?.map((section: SectionType, index: number) => (
        <Section
          key={section.sectionId}
          section={section}
          index={index}
          // Pass userProgress (which might be undefined in viewAsTeacher mode)
          sectionProgress={userProgress?.sections?.find((s: SectionProgressType) => s.sectionId === section.sectionId)}
          chapterId={chapterId as string}
          courseId={courseId as string}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          handleChapterClick={handleChapterClick}
          // Only pass updateChapterProgress if not in view as teacher mode
          updateChapterProgress={isViewAsTeacher ? undefined : updateChapterProgress}
          isViewAsTeacher={isViewAsTeacher} // Pass isViewAsTeacher down
        />
      ))}
    </div>
  );
};

const Section = ({
  section,
  index,
  sectionProgress,
  chapterId,
  courseId,
  expandedSections,
  toggleSection,
  handleChapterClick,
  updateChapterProgress,
  isViewAsTeacher, // Receive isViewAsTeacher prop
}: {
  section: SectionType; // Use SectionType
  index: number;
  sectionProgress: SectionProgressType | undefined; // Use SectionProgressType or undefined
  chapterId: string;
  courseId: string;
  expandedSections: string[];
  toggleSection: (sectionTitle: string) => void;
  handleChapterClick: (sectionId: string, chapterId: string) => void;
  updateChapterProgress: ((sectionId: string, chapterId: string, completed: boolean) => void) | undefined; // Can be undefined
  isViewAsTeacher: boolean; // Prop type
}) => {
  // Use optional chaining as sectionProgress can be undefined
  const completedChapters = sectionProgress?.chapters?.filter((c: ChapterProgress) => c.completed).length || 0; // Use ChapterProgress
  const totalChapters = section.chapters.length;
  const isExpanded = expandedSections.includes(section.sectionTitle);

  return (
    <div className="chapters-sidebar__section">
      <div onClick={() => toggleSection(section.sectionTitle)} className="chapters-sidebar__section-header">
        <div className="chapters-sidebar__section-title-wrapper">
          <p className="chapters-sidebar__section-number">Section 0{index + 1}</p>
          {isExpanded ? <ChevronUp className="chapters-sidebar__chevron" /> : <ChevronDown className="chapters-sidebar__chevron" />}
        </div>
        <h3 className="chapters-sidebar__section-title">{section.sectionTitle}</h3>
      </div>
      <hr className="chapters-sidebar__divider" />

      {isExpanded && (
        <div className="chapters-sidebar__section-content">
          {/* Only show ProgressVisuals if not in view as teacher mode */}
          {!isViewAsTeacher && (
             <ProgressVisuals section={section} sectionProgress={sectionProgress} completedChapters={completedChapters} totalChapters={totalChapters} />
          )}
          <ChaptersList 
            section={section} 
            sectionProgress={sectionProgress} 
            chapterId={chapterId} 
            courseId={courseId} 
            handleChapterClick={handleChapterClick}
            // Pass updateChapterProgress down (might be undefined)
            updateChapterProgress={updateChapterProgress}
            isViewAsTeacher={isViewAsTeacher} // Pass isViewAsTeacher down
            />
        </div>
      )}
      <hr className="chapters-sidebar__divider" />
    </div>
  );
};

const ProgressVisuals = ({ section, sectionProgress, completedChapters, totalChapters }: { section: SectionType; sectionProgress: SectionProgressType | undefined; completedChapters: number; totalChapters: number }) => {
  // Ensure sectionProgress is not undefined before accessing chapters
  const chapterProgresses = sectionProgress?.chapters || [];

  return (
    <>
      <div className="chapters-sidebar__progress">
        <div className="chapters-sidebar__progress-bars">
          {/* Use Chapter type for mapping chapters */}
          {section.chapters.map((chapter: Chapter) => {
            // Use optional chaining
            const isCompleted = chapterProgresses.find((c: ChapterProgress) => c.chapterId === chapter.chapterId)?.completed; // Use ChapterProgress
            return <div key={chapter.chapterId} className={cn("chapters-sidebar__progress-bar", isCompleted && "chapters-sidebar__progress-bar--completed")}></div>;
          })}
        </div>
        <div className="chapters-sidebar__trophy">
          <Trophy className="chapters-sidebar__trophy-icon" />
        </div>
      </div>
      <p className="chapters-sidebar__progress-text">
        {completedChapters}/{totalChapters} COMPLETED
      </p>
    </>
  );
};

const ChaptersList = ({
  section,
  sectionProgress,
  chapterId,
  courseId,
  handleChapterClick,
  updateChapterProgress,
  isViewAsTeacher, // Receive isViewAsTeacher prop
}: {
  section: SectionType; // Use SectionType
  sectionProgress: SectionProgressType | undefined; // Can be undefined
  chapterId: string;
  courseId: string;
  handleChapterClick: (sectionId: string, chapterId: string) => void;
  updateChapterProgress: ((sectionId: string, chapterId: string, completed: boolean) => void) | undefined; // Can be undefined
  isViewAsTeacher: boolean; // Prop type
}) => {
  return (
    <ul className="chapters-sidebar__chapters">
      {/* Use Chapter type for mapping chapters */}
      {section.chapters.map((chapter: Chapter, index: number) => (
        <Chapter
          key={chapter.chapterId}
          chapter={chapter}
          index={index}
          sectionId={section.sectionId}
          sectionProgress={sectionProgress}
          chapterId={chapterId}
          courseId={courseId}
          handleChapterClick={handleChapterClick}
          updateChapterProgress={updateChapterProgress} // Pass down (might be undefined)
          isViewAsTeacher={isViewAsTeacher} // Pass down
        />
      ))}
    </ul>
  );
};

const Chapter = ({
  chapter,
  index,
  sectionId,
  sectionProgress,
  chapterId,
  courseId,
  handleChapterClick,
  updateChapterProgress,
  isViewAsTeacher, // Receive isViewAsTeacher prop
}: {
  chapter: Chapter; // Use Chapter type
  index: number;
  sectionId: string;
  sectionProgress: SectionProgressType | undefined; // Can be undefined
  chapterId: string;
  courseId: string;
  handleChapterClick: (sectionId: string, chapterId: string) => void;
  updateChapterProgress: ((sectionId: string, chapterId: string, completed: boolean) => void) | undefined; // Can be undefined
  isViewAsTeacher: boolean; // Prop type
}) => {
  // Use optional chaining as sectionProgress can be undefined
  const chapterProgress = sectionProgress?.chapters?.find((c: ChapterProgress) => c.chapterId === chapter.chapterId); // Use ChapterProgress
  const isCompleted = chapterProgress?.completed;
  const isCurrentChapter = chapterId === chapter.chapterId;

  // Only allow toggling complete if not in view as teacher mode and updateProgress function is available
  const handleToggleComplete = (e: React.MouseEvent) => {
    if (!isViewAsTeacher && updateChapterProgress) {
      e.stopPropagation();
      updateChapterProgress(sectionId, chapter.chapterId, !isCompleted);
    }
  };

  return (
    <li
      className={cn("chapters-sidebar__chapter", {
        "chapters-sidebar__chapter--current": isCurrentChapter,
      })}
      onClick={() => handleChapterClick(sectionId, chapter.chapterId)}
    >
      {/* Only show completion status check if not in view as teacher mode */}
      {!isViewAsTeacher ? (
        isCompleted ? (
          <div className="chapters-sidebar__chapter-check" onClick={handleToggleComplete} title="Toggle completion status">
            <CheckCircle className="chapters-sidebar__check-icon" />
          </div>
        ) : (
          <div
            className={cn("chapters-sidebar__chapter-number", {
              "chapters-sidebar__chapter-number--current": isCurrentChapter,
            })}
          >
            {index + 1}
          </div>
        )
      ) : (
        // In view as teacher mode, just show the number
        <div
          className={cn("chapters-sidebar__chapter-number", {
            "chapters-sidebar__chapter-number--current": isCurrentChapter,
          })}
        >
          {index + 1}
        </div>
      )}
      <span
        className={cn("chapters-sidebar__chapter-title", {
          "chapters-sidebar__chapter-title--completed": isCompleted,
          "chapters-sidebar__chapter-title--current": isCurrentChapter,
        })}
      >
        {chapter.title}
      </span>
      {chapter.type === "Text" && <FileText className="chapters-sidebar__text-icon" />}
    </li>
  );
};

export default ChaptersSidebar;
