"use client";

import AppSidebar from "@/components/AppSidebar";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ChaptersSidebar from "./user/courses/[courseId]/ChaptersSidebar";
import { useGetUserCourseProgressQuery } from "@/state/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [courseId, setCourseId] = useState<string | null>(null);
  const { user, isLoaded } = useUser();
  const isCoursePage = /^\/user\/courses\/[^\/]+(?:\/chapters\/[^\/]+)?$/.test(pathname);

  useEffect(() => {
    if (isCoursePage) {
      const match = pathname.match(/\/user\/courses\/([^\/]+)/);
      setCourseId(match ? match[1] : null);
    } else {
      setCourseId(null);
    }
  }, [isCoursePage, pathname]);

  // Determine if the user is a teacher
  const isViewAsTeacher = user?.publicMetadata?.userType === "teacher";

  // User progress needs to be fetched or provided.
  // For now, passing undefined as allowed by prop type.
  // TODO: Implement logic to fetch user progress based on user.id and courseId
  // const userProgress = undefined;

  // Fetch user progress when user and courseId are available
  const { data: userProgressData } = useGetUserCourseProgressQuery({
    userId: user?.id || '', // Provide userId, default to empty string if not available
    courseId: courseId || '', // Provide courseId, default to empty string if not available
  }, {
    skip: !user?.id || !courseId, // Skip the query if userId or courseId is not available
  });

  const userProgress = userProgressData?.data; // Extract the progress data

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Please sign in to access this page.</div>;

  return (
    <SidebarProvider>
      <div className="dashboard">
        <AppSidebar />
        <div className="dashboard__content">
          {courseId && <ChaptersSidebar isViewAsTeacher={isViewAsTeacher} userProgress={userProgress} />}
          <div className={cn("dashboard__main", isCoursePage && "dashboard__main--not-course")} style={{ height: "100vh" }}>
            <Navbar isCoursePage={isCoursePage} />
            <main className="dashboard__body">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
