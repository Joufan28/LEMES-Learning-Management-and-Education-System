"use client";

// Add a log to check if the module is loaded
console.log("Course page module loaded");

import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactPlayer from "react-player";
import Loading from "@/components/Loading";
import { useCourseProgressData } from "@/hooks/useCourseProgressData";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { Chapter, Section } from "@/lib/schemas"; // Import Chapter and Section from schemas.ts

const Course = () => {
  const { user, course, userProgress, currentSection, currentChapter, isLoading } = useCourseProgressData();
  const searchParams = useSearchParams();
  const isViewAsTeacher = searchParams.get("viewAsTeacher") === "true";

  // Add detailed logging at the start of the component
  console.log("Rendering Course page:");
  console.log("  isLoading:", isLoading);
  console.log("  isViewAsTeacher:", isViewAsTeacher);
  console.log("  user:", user);
  console.log("  course:", course);
  console.log("  userProgress:", userProgress);
  console.log("  currentSection:", currentSection);
  console.log("  currentChapter:", currentChapter);

  useEffect(() => {
    console.log("Course page useEffect triggered.");
    // You can add more logic here based on state changes if needed for debugging
  }, [isLoading, isViewAsTeacher, user, course, userProgress, currentSection, currentChapter]);

  const playerRef = useRef<ReactPlayer>(null);

  // Simplified handleProgress for View Only mode
  const handleProgress = ({ played }: { played: number }) => {
    if (!isViewAsTeacher) {
      // Original progress tracking logic for students
      // You might need to pass down hasMarkedComplete and setHasMarkedComplete from hook or state if needed here
      // For simplicity in View Only, we just prevent any action
    }
  };

  if (isLoading) {
    console.log("Showing loading state...");
    return <div className="flex items-center justify-center min-h-screen">Memuat data kursus...</div>;
  }

  if (!user) {
     console.log("Showing sign in message...");
     return <div>Please sign in to view this course.</div>;
  }

  // Allow viewing as teacher even if userProgress is null/undefined
  if (!course) {
     console.log("Showing course not found error...");
     return <div>Error loading course or course not found.</div>;
  }

  // Ensure currentSection and currentChapter are available
  if (!currentSection || !currentChapter) {
    console.log("Showing course content not found error...");
    // This might happen if the course has no sections/chapters or the chapterId in the URL is invalid
    return <div>Error: Course content not found. Please check the course structure.</div>;
  }

  console.log("Rendering course content...");
  console.log("Course object structure for debugging:", course);

  // Ensure course is of type Course before accessing its properties
  if (!course || Array.isArray(course) || typeof course !== 'object') {
      console.error("Unexpected state: course is not a valid Course object.", course);
      return <div>Error: Invalid course data received.</div>; // Or handle this state appropriately
  }

  return (
    <div className="course">  
      <div className="course__container">
        <div className="course__breadcrumb">
          <div className="course__path">
            {course.title} / {currentSection?.sectionTitle} / <span className="course__current-chapter">{currentChapter?.title}</span>
          </div>
          <h2 className="course__title">{currentChapter?.title} {isViewAsTeacher && "(View Only)"}</h2>
          <div className="course__header">
            <div className="course__instructor">
              <Avatar className="course__avatar">
                <AvatarImage src={course.teacherImageUrl} alt={course.teacherName} />
                <AvatarFallback className="course__avatar-fallback">{course.teacherName[0]}</AvatarFallback>
              </Avatar>
              <span className="course__instructor-name">{course.teacherName}</span>
            </div>
          </div>
        </div>

        <Card className="course__video">
          <CardContent className="course__video-container">
            {currentChapter?.video ? (
              <ReactPlayer
                ref={playerRef}
                url={currentChapter.video as string}
                controls
                width="100%"
                height="100%"
                onProgress={handleProgress} // Use simplified handler
                config={{
                  file: {
                    attributes: {
                      controlsList: "nodownload",
                    },
                  },
                }}
              />
            ) : (
              <div className="course__no-video">No video available for this chapter.</div>
            )}
          </CardContent>
        </Card>

        <div className="course__content">
          <Tabs defaultValue="Notes" className="course__tabs">
            <TabsList className="course__tabs-list">
              <TabsTrigger className="course__tab" value="Notes">
                Notes
              </TabsTrigger>
              <TabsTrigger className="course__tab" value="Resources">
                Resources
              </TabsTrigger>
              <TabsTrigger className="course__tab" value="Quiz">
                Quiz
              </TabsTrigger>
            </TabsList>

            <TabsContent className="course__tab-content" value="Notes">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Notes Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">{currentChapter?.content}</CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="course__tab-content" value="Resources">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Resources Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {currentChapter?.resourceLinks && currentChapter.resourceLinks.length > 0 ? (
                    <ul>
                      {currentChapter.resourceLinks.map((link: string, index: number) => (
                        <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                      ))}
                    </ul>
                  ) : (
                    <p>No resources available for this chapter.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="course__tab-content" value="Quiz">
              <Card className="course__tab-card">
                <CardHeader className="course__tab-header">
                  <CardTitle>Quiz Content</CardTitle>
                </CardHeader>
                <CardContent className="course__tab-body">
                  {currentChapter?.quizQuestions && currentChapter.quizQuestions.length > 0 ? (
                    <ol>
                      {currentChapter.quizQuestions.map((question: string, index: number) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ol>
                  ) : (
                    <p>No quiz questions available for this chapter.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="course__instructor-card">
            <CardContent className="course__instructor-info">
              <div className="course__instructor-header">
                <Avatar className="course__instructor-avatar">
                  <AvatarImage src={course.teacherImageUrl} alt={course.teacherName} />
                  <AvatarFallback className="course__instructor-avatar-fallback">{course.teacherName[0]}</AvatarFallback>
                </Avatar>
                <div className="course__instructor-details">
                  <h4 className="course__instructor-name">{course.teacherName}</h4>
                  <p className="course__instructor-title">{course.teacherJob}</p>
                </div>
              </div>
              <div className="course__instructor-bio">
                <p>{course.teacherBio}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Course;
